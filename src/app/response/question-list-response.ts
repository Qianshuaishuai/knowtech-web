export class QuestionListResponse{
    F_responseNo: number;
    F_responseMsg: string;
    F_data: Question[];
    F_count: number;
}

export class Question{
    id = 0
    userId = 0
    name = ""
    image = ""
    imageAi = 0
}