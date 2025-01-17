import Whatsapp from "../models/Whatsapp";
import GetWhatsappWbot from "./GetWhatsappWbot";
import fs from "fs";

import {getMessageOptions} from "../services/WbotServices/SendWhatsAppMedia";
import GetProfilePicUrl from "../services/WbotServices/GetProfilePicUrl";
import CreateOrUpdateContactService from "../services/ContactServices/CreateOrUpdateContactService";
import FindOrCreateTicketService from "../services/TicketServices/FindOrCreateTicketService";
import CheckContactNumber from "../services/WbotServices/CheckNumber";
import SetTicketMessagesAsRead from "../helpers/SetTicketMessagesAsRead";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";
import formatBody from "../helpers/Mustache";
import {verifyMessage, verifyQuotedMessage} from "../services/WbotServices/wbotMessageListener";
import Message from "../models/Message";
import mime from "mime";
import CreateMessageService from "../services/MessageServices/CreateMessageService";


export type MessageData = {
  number: number | string;
  body: string;
  mediaPath?: string;
  finalName?: string;
  fileName?: string;
};

export const SendMessage = async (
  whatsapp: Whatsapp,
  messageData: MessageData
): Promise<any> => {
  try {
    const wbot = await GetWhatsappWbot(whatsapp);
    const chatId = `${messageData.number}@s.whatsapp.net`;
    const numberToTest = messageData.number;
    const body = messageData.body;

    const companyId = whatsapp.companyId;

    const CheckValidNumber = await CheckContactNumber(numberToTest.toLocaleString(), companyId);
    const number = CheckValidNumber.jid.replace(/\D/g, "");


    const contactData = {
      name: `${number}`,
      number,
      //profilePicUrl,
      isGroup: false,
      companyId
    };

    const contact = await CreateOrUpdateContactService(contactData, wbot, CheckValidNumber.jid);

    const ticket = await FindOrCreateTicketService(contact, whatsapp.id!, 0, companyId);
    let message;

    if (messageData.mediaPath) {
      const options = await getMessageOptions(
        messageData.fileName,
        messageData.mediaPath,
        messageData.body,
        companyId
      );
      if (options) {
        //const body = fs.readFileSync(messageData.mediaPath);
        var msg = message = await wbot.sendMessage(chatId, {
          ...options
        });

        const mimeType = mime.lookup(messageData.mediaPath);

        const quotedMsg = await verifyQuotedMessage(msg);

        const insertMsg = {
          id: msg.key.id,
          ticketId: ticket.id,
          contactId: msg.key.fromMe ? undefined : contact.id,
          body: body ? formatBody(body, ticket) : messageData.fileName,
          fromMe: msg.key.fromMe,
          read: msg.key.fromMe,
          mediaUrl: messageData.finalName,
          mediaType: typeof mimeType === 'string' ? mimeType.split("/")[0] : 'unknown',
          quotedMsgId: quotedMsg?.id,
          ack: 0,
          remoteJid: msg.key.remoteJid,
          participant: msg.key.participant,
          dataJson: JSON.stringify(msg),
        };

        await ticket.update({
          lastMessage: insertMsg.body,
        });

        await CreateMessageService({
          messageData: insertMsg,
          companyId: ticket.companyId,
        })


      }
    } else {
      const body = `\u200e ${messageData.body}`;
      // message = await wbot.sendMessage(chatId, { text: body });
      const queueChangedMessage = await wbot.sendMessage(
        `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
        {
          text: formatBody(body, ticket)
        });
      await verifyMessage(queueChangedMessage, ticket, ticket.contact);
    }

    await ticket.update({
      lastMessage: body,
    });
    SetTicketMessagesAsRead(ticket);

    return message;
  } catch (err: any) {
    throw new Error(err);
  }
};
