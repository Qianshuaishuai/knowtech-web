export class Book{
    id = 0
    userId = 0
    name = ""
    press = ""
    grade = 0
    pubDate = ""
    cover = ""
    imageAi = 0
    createTimeStr = ""
    pages = new Array()
}

export class Page{
    id = 0
    userId = 0
    bookId = 0
    cover = ""
    frames = new Array()
}

export class Frame{
    id = 0
    userId = 0
    bookId = 0
    pageId = 0
    resourceUrl = ""
    position = ""
}