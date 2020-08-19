export class UserResponse {
    F_responseNo: number;
    F_responseMsg: string;
    F_data: UserInfo;
}

export class UserInfo {
    id: number
    phone: string;
    enable: number;
    payword: string;
    nickname: string;
    sex: number;
    company: string;
}
