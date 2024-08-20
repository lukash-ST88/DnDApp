import { useState } from "react";
import { Task } from "../types"
import TrashIcon from "../icons/TrashIcon";
import { useSortable } from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";

interface ITaskCardProps {
    task: Task
    updateTask: (id: string | number, content: string) => void;
    deleteTask: (id: string | number) => void;
};

const TaskCard = (props:ITaskCardProps) => {
    const [mouseIsOver, setMouseIsOver] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const {setNodeRef, attributes, listeners, transform, transition, isDragging} = useSortable({
        id: props.task.id,
        data: {
            type: "Task",
            task: props.task,
        },
        disabled: editMode,// the task dragging is disabled if the title is on change 
    });
    
    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    }

    const toggleEditMode = () => {
        setEditMode(prev=>!prev);
        setMouseIsOver(false); 
    }

    if(isDragging){
        return (
        <div ref={setNodeRef} style={style} className="bg-mainBackgroundColor p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl border-2 
                                                    border-rose-500 cursor-grab relative">
        </div>)
    }

    if (editMode) {
        return (
            <div ref={setNodeRef} {...listeners} {...attributes} style={style}
                    className="bg-mainBackgroundColor p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl
                            hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grabs relative">
          <textarea className="h-[90%] w-full resize-none border-none rounded bg-transparent text-white focus:outline-none"
                    value={props.task.content}
                    autoFocus
                    placeholder="Task content"
                    onBlur={toggleEditMode}
                    onKeyDown={(e)=>{
                        if(e.key === "Enter" && e.shiftKey) {
                            toggleEditMode();
                        };
                    }}
                    onChange={(e)=> props.updateTask(props.task.id, e.target.value)}></textarea>
        </div>
        )
    }

    return(
        <div onClick={toggleEditMode} onMouseEnter={()=>setMouseIsOver(true)} onMouseLeave={()=>setMouseIsOver(false)} ref={setNodeRef} {...listeners} {...attributes} style={style}

            className="bg-mainBackgroundColor p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl
                        hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grabs relative task">
            <p className="my-auto h-[90%] w-full overflow-y-auto overflow-x-hidden whitespace-pre-wrap">{props.task.content}</p>
            {mouseIsOver && (
                <button onClick={()=> props.deleteTask(props.task.id)}
                        className="stroke-white absolute right-4 top-1/2 -translate-y-1/2 
                                    bg-columnBackgroundColor p-2 rounded opacity-40 hover:opacity-100">
                    <TrashIcon/>
                </button>
            )}
        </div>
    )
};

export default TaskCard;