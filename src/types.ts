export type Column = {
    id: string | number;
    title: string;
}

export type Task = {
    id: string | number;
    columnId: string | number;
    content: string
}