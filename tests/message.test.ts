import { DirectMessage, Message, PublicMessage } from "../src/models/Message";
import { CommandType } from "../src/types/types";


describe("Message Test", () => {
    test("call abstract class function should throw errow", () => {
        let message = new Message({
            username: "",
            command: CommandType.SendPublic,
            message: "This is a test message",
            roomName: "",
            recipientName: ""
        });
        try {
            message.toJSON()
        } catch (error: any) {
            expect(error.message).toBe("Invalid call");
        }
    });

    test("test DirectMessage json string", () => {
        let message = new DirectMessage({
            username: "",
            command: CommandType.SendPrivate,
            message: "This is a test message",
            roomName: "",
            recipientName: ""
        });

        expect(message.toJSON()).toMatchObject({
            username: "",
            command: CommandType.SendPrivate,
            message: "This is a test message",
            recipient: "",
            timeStamp: message.timeStamp
        });
    });

    test("test PublicMessage json string", () => {
        let message = new PublicMessage({
            username: "",
            command: CommandType.SendPublic,
            message: "This is a test message",
            roomName: "",
            recipientName: ""
        });

        expect(message.toJSON()).toMatchObject({
            username: "",
            command: CommandType.SendPublic,
            message: "This is a test message",
            roomName: "",
            timeStamp: message.timeStamp
        });
    });
});