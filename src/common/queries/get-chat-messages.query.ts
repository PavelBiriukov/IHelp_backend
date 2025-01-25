export class GetChatMessagesQuery {
  constructor(
    public readonly chatId: string,
    public readonly skip?: number,
    public readonly limit?: number
  ) {}
}
