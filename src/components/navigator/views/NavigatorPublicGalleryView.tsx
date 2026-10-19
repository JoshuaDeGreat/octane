import { FC, useEffect, useState } from 'react';
import { FaInfoCircle, FaUser } from 'react-icons/fa';
import { localizeWithFallback, TryVisitRoom } from '../../../api';
import { getPublicGallery, PublicGalleryData, publicGalleryImageUrl } from '../../../api/housekeeping/PublicRoomGallery';
import defaultRoom from '../../../assets/images/navigator/air/default-room.png';

export const NavigatorPublicGalleryView: FC<{ filter?: string; onUnavailable: () => void }> = ({ filter = '', onUnavailable }) => {
    const [data, setData] = useState<PublicGalleryData | null>(null);
    const [expanded, setExpanded] = useState<number | null>(null);
    useEffect(() => {
        const abort = new AbortController();
        let busy = false;
        let loaded = false;
        const refresh = async () => {
            if (busy) return;
            busy = true;
            try { const result = await getPublicGallery(false, abort.signal); if (!abort.signal.aborted) { loaded = true; setData(result); } }
            catch { if (!abort.signal.aborted && !loaded) onUnavailable(); }
            finally { busy = false; }
        };
        void refresh();
        const timer = window.setInterval(() => { if (!document.hidden) void refresh(); }, 15000);
        return () => { abort.abort(); window.clearInterval(timer); };
    }, [onUnavailable]);
    if (!data) return <p role="status">{localizeWithFallback('navigator.gallery.loading', 'Loading public rooms…')}</p>;
    const rooms = data.rooms.filter(room => room.name.toLowerCase().includes(filter.trim().toLowerCase()));
    const categories = [...data.categories, { id: 0, name: 'Public rooms', visible: true }];
    return <div className="heaven-public-gallery">
        {!rooms.length && <p>{localizeWithFallback('navigator.gallery.empty', 'No public rooms found.')}</p>}
        {categories.map(category => {
            const entries = rooms.filter(room => room.categoryId === category.id);
            if (!entries.length) return null;
            return <section key={category.id}>
                <h3>{category.name}</h3>
                <div className="heaven-public-gallery__grid">
                    {entries.map(room => <article key={room.roomId}>
                        <button className="heaven-public-gallery__enter" type="button" aria-label={room.name} onClick={() => TryVisitRoom(room.roomId)}>
                            <img alt="" src={publicGalleryImageUrl(room.image) || defaultRoom} onError={event => { if (event.currentTarget.src !== new URL(defaultRoom, window.location.href).href) event.currentTarget.src = defaultRoom; }} />
                            <span className="heaven-public-gallery__count" aria-label={`${room.userCount} / ${room.maxUsers}`}><FaUser aria-hidden="true" /> {room.userCount}</span>
                            <span className="heaven-public-gallery__name">{room.name}</span>
                        </button>
                        <button className="heaven-public-gallery__info" type="button" aria-label={`${localizeWithFallback('navigator.roominfo', 'Room information')}: ${room.name}`} aria-expanded={expanded === room.roomId} onClick={() => setExpanded(expanded === room.roomId ? null : room.roomId)}><FaInfoCircle /></button>
                        {expanded === room.roomId && <p className="heaven-public-gallery__description">{room.description || room.name}<br />{room.userCount} / {room.maxUsers}</p>}
                    </article>)}
                </div>
            </section>;
        })}
    </div>;
};
