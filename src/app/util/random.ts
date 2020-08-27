export default class Random {

    public constructor() {

    }

    public randomString(length): string {
        let outString: string = '';
        let inOptions: string = 'abcdefghijklmnopqrstuvwxyz0123456789';

        for (let i = 0; i < length; i++) {

            outString += inOptions.charAt(Math.floor(Math.random() * inOptions.length));

        }

        return outString;
    }
}