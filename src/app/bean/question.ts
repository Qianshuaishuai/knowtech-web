export class Question{
    id = 0
    userId = 0
    subject = 0
    grade = 0
    name = ""
    image = ""
    imageAi = 0
    createTimeStr = ""
    frames = new Array()
}

export class Frame{
    id = 0
    userId = 0
    questionId = 0
    resourceUrl = ""
    position = ""
}