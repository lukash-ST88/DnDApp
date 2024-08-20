import { useMemo, useState } from "react";
import PlusIcon from "../icons/PlusIcon";
import { Column, Task } from "../types";
import ColumnContainer from "./ColumnContainer";
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import TaskCard from "./TaskCard";

const KanbanBoard = () => {
    const [columns, setColumns] = useState<Column[]>([])
    const [tasks, setTasks] = useState<Task[]>([]);

    const [activeColumn, setActiveColumn] = useState<Column | null>(null);
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    
    const columnsId = useMemo(()=> columns.map((column: Column)=>column.id), [columns]) // useMemo is used to memoize the columnsId array so that it doesn't get recreated every time the columns array changes

    // this sensor allows to use click for delete button, because if we want to initiate dragging event we need to move pressed mouse to 8 px 
    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8
        }
    }))

    function generateId(){
        return Math.floor(Math.random() * 1001)
    }

    function createNewColumn(){
        const columnToAdd: Column = {
            id: generateId(),
            title: `Column ${columns.length + 1}`
        }
        setColumns([...columns, columnToAdd])
    }

    function createTask(columnId: number | string){
        const newTask: Task ={
            id: generateId(),
            columnId,
            content: `Task ${tasks.length + 1}`
        };
        setTasks([...tasks, newTask])
    }

    function updateTask(id: number | string, content: string){
        const newTasks = tasks.map((task:Task)=>{
            if(task.id !== id) return task;
            return {...task, content}
        });
        setTasks(newTasks);
    }

    function deleteTask(id: number | string){
        const newTask = tasks.filter((task)=> task.id !== id);
        setTasks(newTask);
    }

    function updateColumn(id: string | number, title: string){
        const newColumns = columns.map((column)=>{
            if(column.id !== id) return column;
            return {...column, title}
        });
        setColumns(newColumns);
    }

    function deleteColumn(columnId: number | string){
        const filterColumns = columns.filter((column: Column)=> column.id !== columnId)
        setColumns(filterColumns)
        const newTasks = tasks.filter((task: Task)=> task.columnId !== columnId)
        setTasks(newTasks);
    }

    function onDragStart(event: DragStartEvent){
        if (event.active.data.current?.type === "Column"){
            setActiveColumn(event.active.data.current.column);
            return;
        }
        if (event.active.data.current?.type === "Task"){
            setActiveTask(event.active.data.current.task)
            return;    
        }
    }

    function onDragOver(event: DragOverEvent){
        const {active, over} = event;
        if(!over) return;
        const activeId = active.id;
        const overId = over.id;

        const isActiveTask = active.data.current?.type === "Task";
        const isOverTask = over.data.current?.type === "Task";
        const isActiveColumn = active.data.current?.type === "Column";
        const isOverColumn = over.data.current?.type === "Column";

        if(!isActiveTask)return;

        // Drop task over another task
        if(isActiveTask && isOverTask){
          setTasks((prevTasks: Task[]) => {
            const activeIndex = prevTasks.findIndex((task: Task)=> task.id === activeId);
            const overIndex = prevTasks.findIndex((task: Task)=> task.id === overId);

            if(tasks[activeIndex].columnId !== tasks[overIndex].columnId){
                tasks[activeIndex].columnId = tasks[overIndex].columnId;
            }
            return arrayMove(prevTasks, activeIndex, overIndex);
          })
        }
        // Drop task over column
        if(isActiveTask && isOverColumn){
            setTasks((prevTasks: Task[]) => {
                const activeIndex = prevTasks.findIndex((task: Task)=> task.id === activeId);
               
    
                if(tasks[activeIndex].columnId !== overId){
                    tasks[activeIndex].columnId = overId;
                }
                return arrayMove(prevTasks, activeIndex, activeIndex);
              })
        }
    }

    function onDragEnd(event: DragEndEvent){
        setActiveColumn(null);
        setActiveTask(null);

        const {active, over} = event;
        if(!over) return;
        const activeColumnId = active.id;
        const overColumnId = over.id;

        setColumns((prevColumns: Column[]) => {
            const activeColumnIndex = prevColumns.findIndex((column: Column)=> column.id === activeColumnId);
            const overColumnIndex = prevColumns.findIndex((column: Column)=> column.id === overColumnId);
            return arrayMove(prevColumns, activeColumnIndex, overColumnIndex);
        })
    }
    
    return(
    <div className="m-auto flex min-h-screen w-full items-center overflow-x-auto overflow-y-auto px-[40px] bg-yellow-300">
        <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd} onDragOver={onDragOver} sensors={sensors}>
            <div className="m-auto flex gap-2">
                <div className="flex gap-2">
                    <SortableContext items={columnsId}>
                        {columns.map((column: Column)=> (
                            <ColumnContainer 
                                column={column}
                                tasks={tasks.filter((task:Task)=>task.columnId === column.id)} 
                                createTask={createTask}
                                updateTask={updateTask}
                                deleteTask={deleteTask} 
                                updateColumn={updateColumn} 
                                deleteColumn={deleteColumn}/>
                        ))}
                    </SortableContext>
                </div>
                <button onClick={()=> createNewColumn()}
                        className="h-[60px] w-[350px] min-w-[350px] cursor-pointer rounded-lg 
                                bg-mainBackgroundColor border-2 border-columnBackgroundColor p-4 ring-rose-500 hover:ring-2 flex gap-2">
                    <PlusIcon/> Add column
                </button>
            </div>
            {/* createPortal is used to let the children access to the body document */}
            {/* DragOverlay is used to make a projection of component during dragging */}
            {createPortal(
                <DragOverlay>
                    {activeColumn && (<ColumnContainer tasks={tasks.filter((task:Task)=>task.columnId === activeColumn.id)} createTask={createTask} updateTask={updateTask} deleteTask={deleteTask} column={activeColumn} updateColumn={updateColumn} deleteColumn={deleteColumn}/>)}
                    {activeTask && (<TaskCard task={activeTask} updateTask={updateTask} deleteTask={deleteTask}/>)}
                </DragOverlay>, document.body)}
        </DndContext>
    </div>)
}
export default KanbanBoard;