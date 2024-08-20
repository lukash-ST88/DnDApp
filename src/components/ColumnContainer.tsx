import { SortableContext, useSortable } from "@dnd-kit/sortable";
import TrashIcon from "../icons/TrashIcon";
import { Column, Task } from "../types"
import {CSS} from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import PlusIcon from "../icons/PlusIcon";
import TaskCard from "./TaskCard";

interface IColumnContainerProp {
    column: Column
    tasks: Task[]
    createTask: (id: string | number)=> void
    updateTask: (id: string | number, content: string) => void;
    deleteTask: (id: string | number) => void;
    updateColumn: (id: string | number, title: string)=> void
    deleteColumn: (id: string | number)=> void
}

const ColumnContainer = (props:IColumnContainerProp) => {
    const [editMode, setEditMode] = useState(false);

    const {setNodeRef, attributes, listeners, transform, transition, isDragging} = useSortable({
        id: props.column.id,
        data: {
            type: "Column",
            column: props.column,
        },
        disabled: editMode,// the column dragging is disabled if the title is on change 
    });

    const tasksIds = useMemo(()=>{
        return props.tasks.map((task)=> task.id);
    }, [props.tasks])

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    }

    if(isDragging){
        return (
        <div ref={setNodeRef} style={style}
            className="bg-columnBackgroundColor opacity-40 
                        w-[350px] h-[500px] max-h-[500px] rounded-md 
                        flex flex-col border-2 border-rose-500">
                
        </div>)
    }

  

    return(
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}
            className="bg-columnBackgroundColor w-[350px] h-[350px] max-h-[500px]
                        rounded-md flex flex-col justify-between">
            <div onClick={()=> setEditMode(true)}
                className="bg-mainBackgroundColor text-md h-[60px] cursor-grab rounded-md
                            rounded-b-none p-3 font-bold border-columnBackgroundColor border-4
                            flex items-center justify-between">
                <div className="flex gap-2">
                    <div className="flex justify-center items-center bg-columnBackgroundColor px-2 py-1 text-sm rounded-full">0</div>
                    {!editMode && props.column.title}
                    {editMode && <input autoFocus 
                                        onBlur={()=> {setEditMode(false)}} 
                                        onKeyDown={(e)=> {if(e.key === "Enter"){setEditMode(false)}}}
                                        value={props.column.title}
                                        onChange={(e)=> props.updateColumn(props.column.id, e.target.value)}
                                        className="text-black"/>} 
                </div>
                <button onClick={()=> props.deleteColumn(props.column.id)}
                        className="stroke-gray-500 hover:stroke-white"> 
                    <TrashIcon/> 
                </button>
            </div>
            <div className="flex flex-glow flex-col gap-4 p-2
                            overflow-x-hidden overflow-y-auto">
                <SortableContext items={tasksIds}>
                    {props.tasks.map((task: Task)=>(
                        <TaskCard task={task} key={task.id} updateTask={props.updateTask} deleteTask={props.deleteTask}/>
                    ))}
                </SortableContext>
            </div>
            <button onClick={()=> props.createTask(props.column.id)}
                    className="flex gap-2 items-center
                              border-columnBackgroundColor border-2 rounded-md p-4
                              border-x-columnBackgroundColor
                              hover:bg-mainBackgroundColor hover:text-rose-500
                              active:bg-black">
                 <PlusIcon/> Add task
            </button>
        </div>
    )
}
export default ColumnContainer; 