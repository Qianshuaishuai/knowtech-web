export class BookListResponse{
    F_responseNo: number;
    F_responseMsg: string;
    F_data: Book[];
    F_count: number;
}

export class Book{
    id = 0
    userId = 0
    name = ""
    press = ""
    grade = 0
    pubDate = ""
    cover = ""
    imageAi = 0
}