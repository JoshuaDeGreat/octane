import {
    CreateLinkEvent,
    GetModeratorRoomInfoMessageComposer,
    ModerateRoomMessageComposer,
    ModeratorActionMessageComposer,
    ModeratorRoomInfoEvent
} from '@octane/renderer';
import { FC, useEffect, useState } from 'react';
import { LocalizeText, SendMessageComposer, TryVisitRoom } from '../../../../api';
import { Button, DraggableWindowPosition, OctaneCardContentView, OctaneCardHeaderView, OctaneCardView, Text } from '../../../../common';
import { useMessageEvent, useModTools } from '../../../../hooks';
import { ModToolsTemplateSelectView } from '../ModToolsTemplateSelectView';

interface ModToolsRoomViewProps {
    roomId: number;
    onCloseClick: () => void;
}

export const ModToolsRoomView: FC<ModToolsRoomViewProps> = (props) => {
    const { roomId = null, onCloseClick = null } = props;
    const [infoRequested, setInfoRequested] = useState(false);
    const [loadedRoomId, setLoadedRoomId] = useState(null);
    const [name, setName] = useState(null);
    const [ownerId, setOwnerId] = useState(null);
    const [ownerName, setOwnerName] = useState(null);
    const [ownerInRoom, setOwnerInRoom] = useState(false);
    const [usersInRoom, setUsersInRoom] = useState(0);
    const [kickUsers, setKickUsers] = useState(false);
    const [lockRoom, setLockRoom] = useState(false);
    const [changeRoomName, setChangeRoomName] = useState(false);
    const [message, setMessage] = useState('');
    const { settings = null } = useModTools();

    const refresh = () => SendMessageComposer(new GetModeratorRoomInfoMessageComposer(roomId));

    const handleClick = (action: string) => {
        if (!action) return;

        switch (action) {
            case 'alert_only':
                if (message.trim().length === 0) return;

                SendMessageComposer(new ModeratorActionMessageComposer(ModeratorActionMessageComposer.ACTION_ALERT, message, ''));
                SendMessageComposer(new ModerateRoomMessageComposer(roomId, lockRoom ? 1 : 0, changeRoomName ? 1 : 0, kickUsers ? 1 : 0));
                return;
            case 'send_message':
                if (message.trim().length === 0) return;

                SendMessageComposer(new ModeratorActionMessageComposer(ModeratorActionMessageComposer.ACTION_MESSAGE, message, ''));
                SendMessageComposer(new ModerateRoomMessageComposer(roomId, lockRoom ? 1 : 0, changeRoomName ? 1 : 0, kickUsers ? 1 : 0));
                return;
        }
    };

    useMessageEvent<ModeratorRoomInfoEvent>(ModeratorRoomInfoEvent, (event) => {
        const parser = event.getParser();

        if (!parser || parser.data.flatId !== roomId) return;

        setLoadedRoomId(parser.data.flatId);
        setName(parser.data.room.name);
        setOwnerId(parser.data.ownerId);
        setOwnerName(parser.data.ownerName);
        setOwnerInRoom(parser.data.ownerInRoom);
        setUsersInRoom(parser.data.userCount);
    });

    useEffect(() => {
        if (infoRequested) return;

        SendMessageComposer(new GetModeratorRoomInfoMessageComposer(roomId));
        setInfoRequested(true);
    }, [roomId, infoRequested]);

    const isLoaded = loadedRoomId !== null;
    const hasMessage = message.trim().length > 0;
    const ownerPillClass = ownerInRoom ? 'bg-[#f7f7f2] text-[#111] border-[#959595]' : 'bg-[#f7f7f2] text-[#111] border-[#959595]';
    const ownerDotClass = ownerInRoom ? 'bg-emerald-500' : 'bg-zinc-400';

    return (
        <OctaneCardView
            className="octane-mod-tools-room min-w-0 w-[min(380px,calc(100vw-16px))] max-w-[calc(100vw-16px)] max-h-[calc(100vh-16px)]"
            theme="primary-slim"
            windowPosition={DraggableWindowPosition.TOP_LEFT}
        >
            <OctaneCardHeaderView headerText={LocalizeText('modtools.roominfo.title')} onCloseClick={() => onCloseClick()} />
            <OctaneCardContentView className="text-black" gap={2}>
                {/* Identity header */}
                <div className="flex items-center gap-2 rounded p-2 border border-[#959595]">
                    <div className="flex flex-col grow min-w-0">
                        <Text bold className="truncate text-base leading-tight">
                            {name || LocalizeText('modtools.roominfo.loading')}
                        </Text>
                        <Text className="opacity-60 text-xs truncate">#{roomId}</Text>
                    </div>
                    <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${ownerPillClass}`}
                        title={ownerInRoom ? LocalizeText('modtools.roominfo.owner.title.here') : LocalizeText('modtools.roominfo.owner.title.away')}
                    >
                        <span className={`inline-block w-2 h-2 rounded-full ${ownerDotClass}`} />
                        {ownerInRoom ? LocalizeText('modtools.roominfo.owner.here') : LocalizeText('modtools.roominfo.owner.away')}
                    </span>
                    <button
                        className="octane-mod-tools-button"
                        onClick={refresh}
                        title={LocalizeText('modtools.roominfo.refresh')}
                    >
                        {LocalizeText('modtools.roominfo.refresh')}
                    </button>
                </div>

                {/* Stat strip */}
                <div className="flex gap-1.5">
                    <div className="flex flex-col items-center justify-center px-2 py-1.5 rounded border bg-[#f7f7f2] border-[#959595] text-[#1c789b] grow min-w-0">
                        <div className="flex items-center gap-1.5 text-[.7rem] uppercase tracking-wide opacity-70">
                            <span>{LocalizeText('modtools.roominfo.stat.users')}</span>
                        </div>
                        <div className="text-lg font-semibold tabular-nums leading-tight">{usersInRoom}</div>
                    </div>
                    <div className="flex flex-col items-center justify-center px-2 py-1.5 rounded border bg-[#f7f7f2] border-[#959595] text-[#111] grow min-w-0">
                        <div className="flex items-center gap-1.5 text-[.7rem] uppercase tracking-wide opacity-70">
                            <span>{LocalizeText('modtools.roominfo.stat.owner')}</span>
                        </div>
                        <div
                            className="text-sm font-semibold leading-tight truncate max-w-full underline cursor-pointer hover:text-sky-700"
                            onClick={() => ownerId && CreateLinkEvent(`mod-tools/open-user-info/${ownerId}`)}
                            title={ownerName ? LocalizeText('modtools.roominfo.owner.open', ['username'], [ownerName]) : ''}
                        >
                            {ownerName || '-'}
                        </div>
                    </div>
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-2 gap-1.5">
                    <Button gap={1} variant="secondary" onClick={() => TryVisitRoom(roomId)}>
                        {LocalizeText('modtools.roominfo.button.visit')}
                    </Button>
                    <Button gap={1} variant="secondary" onClick={() => CreateLinkEvent(`mod-tools/open-room-chatlog/${roomId}`)}>
                        {LocalizeText('modtools.roominfo.button.chatlog')}
                    </Button>
                </div>

                {/* Moderate panel */}
                <div className="flex flex-col gap-1.5 bg-[#f7f7f2] border border-[#959595] rounded p-2">
                    <div className="flex items-center gap-1.5 text-[.7rem] uppercase tracking-wide font-semibold text-[#111]">
                        {LocalizeText('modtools.roominfo.moderate.title')}
                    </div>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input checked={kickUsers} className="form-check-input" type="checkbox" onChange={(event) => setKickUsers(event.target.checked)} />
                        <span>{LocalizeText('modtools.roominfo.moderate.kick')}</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input checked={lockRoom} className="form-check-input" type="checkbox" onChange={(event) => setLockRoom(event.target.checked)} />
                        <span>{LocalizeText('modtools.roominfo.moderate.doorbell')}</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                            checked={changeRoomName}
                            className="form-check-input"
                            type="checkbox"
                            onChange={(event) => setChangeRoomName(event.target.checked)}
                        />
                        <span>{LocalizeText('modtools.roominfo.moderate.rename')}</span>
                    </label>
                    <ModToolsTemplateSelectView templates={settings?.roomMessageTemplates} onSelect={setMessage} />
                    <textarea
                        className="min-h-[60px] px-2 py-1.5 rounded text-sm border border-[#959595] bg-white/70 focus:outline-none"
                        placeholder={LocalizeText('modtools.roominfo.moderate.message.placeholder')}
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                    />
                    <div className="flex gap-1.5">
                        <Button className="grow" disabled={!hasMessage || !isLoaded} gap={1} variant="danger" onClick={() => handleClick('send_message')}>
                            {LocalizeText('modtools.roominfo.moderate.send.caution')}
                        </Button>
                        <Button className="grow" disabled={!hasMessage || !isLoaded} gap={1} variant="warning" onClick={() => handleClick('alert_only')}>
                            {LocalizeText('modtools.roominfo.moderate.send.alert')}
                        </Button>
                    </div>
                </div>
            </OctaneCardContentView>
        </OctaneCardView>
    );
};
