import {
    CallForHelpFromForumMessageMessageComposer,
    CallForHelpFromForumThreadMessageComposer,
    CallForHelpFromIMMessageComposer,
    CallForHelpFromPhotoMessageComposer,
    CallForHelpMessageComposer
} from '@octane/renderer';
import { FC, useState } from 'react';
import { getReportRoomId, GoToDesktop, LocalizeText, ReportType, SendMessageComposer } from '../../../api';
import { Button, Text } from '../../../common';
import { useHelp } from '../../../hooks';

export const ReportSummaryView: FC<{}> = (props) => {
    const { activeReport = null, setActiveReport = null } = useHelp();
    const [sending, setSending] = useState(false);

    const submitReport = () => {
        if (sending) return;
        setSending(true);
        const chats: (string | number)[] = [];

        switch (activeReport.reportType) {
            case ReportType.BULLY:
            case ReportType.EMERGENCY:
            case ReportType.ROOM: {
                const reportedRoomId = getReportRoomId(activeReport);

                activeReport.reportedChats.forEach((entry) => chats.push(entry.webId, entry.message));

                SendMessageComposer(
                    new CallForHelpMessageComposer(activeReport.message, activeReport.cfhTopic, activeReport.reportedUserId, reportedRoomId, chats)
                );
                break;
            }
            case ReportType.STAFF_HELP:
                SendMessageComposer(new CallForHelpMessageComposer(activeReport.message, activeReport.cfhTopic, -1, getReportRoomId(activeReport), []));
                break;
            case ReportType.IM:
                activeReport.reportedChats.forEach((entry) => chats.push(entry.webId, entry.message));

                SendMessageComposer(new CallForHelpFromIMMessageComposer(activeReport.message, activeReport.cfhTopic, activeReport.reportedUserId, chats));
                break;
            case ReportType.THREAD:
                SendMessageComposer(
                    new CallForHelpFromForumThreadMessageComposer(activeReport.groupId, activeReport.threadId, activeReport.cfhTopic, activeReport.message)
                );
                break;
            case ReportType.MESSAGE:
                SendMessageComposer(
                    new CallForHelpFromForumMessageMessageComposer(
                        activeReport.groupId,
                        activeReport.threadId,
                        activeReport.messageId,
                        activeReport.cfhTopic,
                        activeReport.message
                    )
                );
                break;
            case ReportType.PHOTO:
                SendMessageComposer(
                    new CallForHelpFromPhotoMessageComposer(
                        activeReport.extraData,
                        activeReport.roomId,
                        activeReport.reportedUserId,
                        activeReport.cfhTopic,
                        activeReport.roomObjectId
                    )
                );
                break;
        }

        if (activeReport.leaveRoom) GoToDesktop();

        setActiveReport(null);
    };

    return (
        <>
            <div className="flex flex-col gap-1">
                <Text fontSize={4}>{activeReport.urgent ? 'Send an urgent request to Heaven staff' : 'Send to the Heaven team'}</Text>
                <p className="heaven-help-review">{activeReport.message}</p>
                <Text>Your request is saved for our moderators and admins. Staff can reply in the hotel. Please do not include passwords or recovery codes.</Text>
            </div>
            <Button variant="success" disabled={sending} onClick={submitReport}>
                {sending ? 'Sending…' : 'Send to Heaven staff'}
            </Button>
        </>
    );
};
