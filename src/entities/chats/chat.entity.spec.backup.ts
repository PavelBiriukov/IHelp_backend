/* import { ChatEntity } from './chat.entity';
import { ChatsRepository } from '../../datalake/chats/chats.repository';
import { MessagesRepository } from '../../datalake/messages/messages.repository';
import {
  chatId,
  taskId,
  recipientMessage,
  volunteerMessage,
  taskChatMetadata,
  systemChatMetadata,
  conflictChatsMetadata,
  taskСhatMessages,
  systemСhatMessages,
  conflictСhatMessages,
} from './chat.entity.test.constants';
import { ChatType, ChatTypes } from '../../common/types/chats.types';

describe('ChatEntity', () => {
  let chatEntity: ChatEntity<ChatType>;
  let chatsRepository: Partial<Record<keyof ChatsRepository, jest.Mock>>;
  let messagesRepository: Partial<Record<keyof MessagesRepository, jest.Mock>>;

  beforeEach(async () => {
    chatsRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findOneAndUpdate: jest.fn(),
      findOne: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };
    messagesRepository = {
      create: jest.fn(),
      find: jest.fn(),
    };

    chatEntity = new ChatEntity<ChatType>(
      chatsRepository as unknown as ChatsRepository,
      messagesRepository as unknown as MessagesRepository
    );
  });

  it('should be defined', () => {
    expect(chatEntity).toBeDefined();
  });

  it('Should create, load messages, add message, find by params and close a task chat', async () => {
    (chatsRepository.create as jest.Mock).mockResolvedValue({
      _id: chatId,
      ...taskChatMetadata,
    });
    await chatEntity.createChat(ChatTypes.TASK_CHAT as any, taskChatMetadata);
    expect(chatEntity['_chatId']).toEqual(chatId);
    expect(chatEntity['_taskId']).toEqual(taskId);
    expect(chatEntity['_volunteer']).toEqual(taskChatMetadata.volunteer);
    expect(chatEntity['_recipient']).toEqual(taskChatMetadata.recipient);
    expect(chatEntity['_metadata']['isActive']).toEqual(true);

    (messagesRepository.find as jest.Mock).mockResolvedValue(taskСhatMessages);
    const loadedMessages = await chatEntity.loadMessages([chatId], 0, 20);
    expect(loadedMessages).toEqual(taskСhatMessages);
    expect(messagesRepository.find).toHaveBeenCalledWith({ chatId: { $in: [chatId] } }, null, {
      skip: 0,
      limit: 20,
    });

    const params = { taskId };
    (chatsRepository.findOne as jest.Mock).mockResolvedValue({
      ...taskChatMetadata,
      _id: chatId,
    });
    const foundChat = await chatEntity.findChatByParams(params);
    expect(foundChat).toBeInstanceOf(ChatEntity);
    expect(foundChat!.chatId).toEqual(chatId);
    expect(foundChat!.metadata).toEqual(taskChatMetadata);
    expect(chatsRepository.findOne).toHaveBeenCalledWith(params);

    (messagesRepository.create as jest.Mock).mockResolvedValue(volunteerMessage);
    await chatEntity.addMessage(volunteerMessage);
    expect(chatEntity.messages).toContainEqual(volunteerMessage);
    expect(messagesRepository.create).toHaveBeenCalledWith({
      ...volunteerMessage,
      chatId: chatEntity.chatId,
    });

    (chatsRepository.findByIdAndUpdate as jest.Mock).mockResolvedValue({
      ...taskChatMetadata,
      isActive: false,
    });
    await chatEntity.closeChat();
    expect(chatEntity['_metadata']['isActive']).toEqual(false);
    expect(chatsRepository.findByIdAndUpdate).toHaveBeenCalledWith(
      chatId,
      { isActive: false },
      { new: true }
    );
  });

  it('Should create, load messages, add message, find by params and close a system chat', async () => {
    (chatsRepository.create as jest.Mock).mockResolvedValue({
      _id: chatId,
      ...systemChatMetadata,
    });
    await chatEntity.createChat(ChatTypes.SYSTEM_CHAT as any, systemChatMetadata);
    expect(chatEntity['_chatId']).toEqual(chatId);
    expect(chatEntity['_user']).toEqual(systemChatMetadata.user); // Проверка _user
    expect(chatEntity['_admin']).toEqual(systemChatMetadata.admin);
    expect(chatEntity['_metadata']['isActive']).toEqual(true);

    (messagesRepository.find as jest.Mock).mockResolvedValue(systemСhatMessages);
    const loadedMessages = await chatEntity.loadMessages([chatId], 0, 20);
    expect(loadedMessages).toEqual(systemСhatMessages);
    expect(messagesRepository.find).toHaveBeenCalledWith({ chatId: { $in: [chatId] } }, null, {
      skip: 0,
      limit: 20,
    });

    const params = { taskId };
    (chatsRepository.findOne as jest.Mock).mockResolvedValue({
      ...systemChatMetadata,
      _id: chatId,
    });
    const foundChat = await chatEntity.findChatByParams(params);
    expect(foundChat).toBeInstanceOf(ChatEntity);
    expect(foundChat!.chatId).toEqual(chatId);
    expect(foundChat!.metadata).toEqual(systemChatMetadata);
    expect(chatsRepository.findOne).toHaveBeenCalledWith(params);

    (messagesRepository.create as jest.Mock).mockResolvedValue(volunteerMessage);
    await chatEntity.addMessage(volunteerMessage);
    expect(chatEntity.messages).toContainEqual(volunteerMessage);
    expect(messagesRepository.create).toHaveBeenCalledWith({
      ...volunteerMessage,
      chatId: chatEntity.chatId,
    });

    (chatsRepository.findByIdAndUpdate as jest.Mock).mockResolvedValue({
      ...systemChatMetadata,
      isActive: false,
    });
    await chatEntity.closeChat();
    expect(chatEntity['_metadata']['isActive']).toEqual(false);
    expect(chatsRepository.findByIdAndUpdate).toHaveBeenCalledWith(
      chatId,
      { isActive: false },
      { new: true }
    );
  });

  it('Should create, load messages, add message, find by params and close a conflict chat with recipient', async () => {
    (chatsRepository.create as jest.Mock).mockResolvedValue({
      _id: chatId,
      ...conflictChatsMetadata,
      isActive: true,
    });

    await chatEntity.createChat(ChatTypes.CONFLICT_CHAT as any, conflictChatsMetadata);
    expect(chatEntity['_chatId']).toEqual(chatId);
    expect(chatEntity['_taskId']).toEqual(taskId);
    expect(chatEntity['_volunteer']).toEqual(conflictChatsMetadata.meta[0].volunteer);
    expect(chatEntity['_recipient']).toEqual(conflictChatsMetadata.meta[1].recipient);
    expect(chatEntity['_admin']).toEqual(conflictChatsMetadata.moderator);
    expect(chatEntity['_metadata']['isActive']).toEqual(true);

    (messagesRepository.find as jest.Mock).mockResolvedValue(conflictСhatMessages);
    const loadedMessages = await chatEntity.loadMessages([chatId], 0, 20);
    expect(loadedMessages).toEqual([
      [volunteerMessage, volunteerMessage],
      [recipientMessage, recipientMessage, recipientMessage, recipientMessage, recipientMessage],
    ]);
    expect(messagesRepository.find).toHaveBeenCalledWith({ chatId: { $in: [chatId] } }, null, {
      skip: 0,
      limit: 20,
    });

    const params = { taskId };
    (chatsRepository.findOne as jest.Mock).mockResolvedValue({
      ...conflictChatsMetadata,
      _id: chatId,
    });
    const foundChat = await chatEntity.findChatByParams(params);
    expect(foundChat).toBeInstanceOf(ChatEntity);
    expect(foundChat!.chatId).toEqual(chatId);

    const expectedMetadata = {
      ...conflictChatsMetadata,
      _id: chatId,
    };
    expect(foundChat!.metadata).toEqual(expectedMetadata);
    expect(chatsRepository.findOne).toHaveBeenCalledWith(params);

    (messagesRepository.create as jest.Mock).mockResolvedValue(volunteerMessage);
    await chatEntity.addMessage(volunteerMessage);
    expect(chatEntity.messages[0]).toContainEqual(volunteerMessage);
    expect(messagesRepository.create).toHaveBeenCalledWith({
      ...volunteerMessage,
      chatId: chatEntity.chatId,
    });

    (messagesRepository.create as jest.Mock).mockResolvedValue(recipientMessage);
    await chatEntity.addMessage(recipientMessage);
    expect(chatEntity.messages[1]).toContainEqual(recipientMessage);
    expect(messagesRepository.create).toHaveBeenCalledWith({
      ...recipientMessage,
      chatId: chatEntity.chatId,
    });

    (chatsRepository.findByIdAndUpdate as jest.Mock).mockResolvedValue({
      ...conflictChatsMetadata,
      isActive: false,
    });
    await chatEntity.closeChat();
    expect(chatEntity['_metadata']['isActive']).toEqual(false);
    expect(chatsRepository.findByIdAndUpdate).toHaveBeenCalledWith(
      chatId,
      { isActive: false },
      { new: true }
    );
  });
});
*/
