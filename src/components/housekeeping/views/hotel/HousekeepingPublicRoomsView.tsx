import { FC, useEffect, useState } from 'react';
import { localizeWithFallback } from '../../../../api';
import { getPublicGallery, PublicGalleryData, PublicGalleryRoom, publicGalleryError, publicGalleryImageUrl, savePublicGalleryRoom, uploadPublicGalleryImage } from '../../../../api/housekeeping/PublicRoomGallery';
import defaultRoom from '../../../../assets/images/navigator/air/default-room.png';
import { HOUSEKEEPING_INPUT_CLASS, HousekeepingButton, HousekeepingField } from '../common/HousekeepingParts';

const text = (key: string, fallback: string) => localizeWithFallback(`housekeeping.public_rooms.${key}`, fallback);
type Draft = Pick<PublicGalleryRoom, 'roomId' | 'categoryId' | 'order' | 'image' | 'visible'>;
const emptyDraft: Draft = { roomId: 0, categoryId: 0, order: 0, image: '', visible: true };

export const HousekeepingPublicRoomsView: FC = () => {
    const [data, setData] = useState<PublicGalleryData | null>(null);
    const [draft, setDraft] = useState<Draft>(emptyDraft);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    useEffect(() => {
        const abort = new AbortController();
        getPublicGallery(true, abort.signal).then(result => { if (!abort.signal.aborted) setData(result); })
            .catch(cause => { if (!abort.signal.aborted) setError(publicGalleryError(cause)); });
        return () => abort.abort();
    }, []);
    useEffect(() => {
        if (!file) { setPreview(''); return; }
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);
    const choose = (room?: PublicGalleryRoom) => {
        setError(''); setNotice(''); setFile(null);
        setDraft(room ? { roomId: room.roomId, categoryId: room.categoryId, order: room.order, image: room.image, visible: room.visible }
            : { ...emptyDraft, categoryId: data?.categories.find(category => category.name.toLowerCase() === 'public rooms')?.id ?? data?.categories[0]?.id ?? 0, order: (data?.rooms.length ?? 0) * 10 });
    };
    const save = async () => {
        setBusy(true); setError(''); setNotice('');
        try {
            let image = draft.image;
            if (file) image = (await uploadPublicGalleryImage(draft.roomId, file)).image;
            const result = await savePublicGalleryRoom({ ...draft, image });
            setData(result); setDraft({ ...draft, image }); setFile(null);
            setNotice(text('saved', 'Saved. Reopen the Public tab to see your changes.'));
        } catch (cause) { setError(publicGalleryError(cause)); }
        finally { setBusy(false); }
    };
    const selected = data?.rooms.find(room => room.roomId === draft.roomId);
    return <div className="heaven-gallery-admin">
        <p>{text('intro', 'Choose rooms for the Public tab, upload a picture and set their display order. Hiding a listing keeps the room itself.')}</p>
        {error && <p role="alert" className="text-red-700">{error}</p>}
        {notice && <p role="status" className="text-green-700">{notice}</p>}
        {!data && !error && <p role="status">{text('loading', 'Loading public rooms…')}</p>}
        {data && <>
            <div className="heaven-gallery-admin__rooms">
                {data.rooms.map(room => <button key={room.roomId} disabled={busy} type="button" aria-pressed={draft.roomId === room.roomId} onClick={() => choose(room)}>
                    <img alt="" src={publicGalleryImageUrl(room.image) || defaultRoom} />
                    <span>{room.name}<small>#{room.roomId} · {room.visible ? text('visible', 'Visible') : text('hidden', 'Hidden')} · {room.order}</small></span>
                </button>)}
            </div>
            <HousekeepingButton disabled={busy} variant="secondary" onClick={() => choose()}>{text('add', 'Add a room')}</HousekeepingButton>
            <h3>{selected?.name || text('details', 'Room details')}</h3>
            <div className="grid grid-cols-2 gap-2">
                <HousekeepingField label={text('room_id', 'Room ID')}><input className={HOUSEKEEPING_INPUT_CLASS} type="number" min={1} disabled={busy} value={draft.roomId || ''} onChange={event => { setFile(null); setDraft({ ...draft, roomId: Number(event.target.value), image: '' }); }} /></HousekeepingField>
                <HousekeepingField label={text('category', 'Public category')}><select className={HOUSEKEEPING_INPUT_CLASS} disabled={busy} value={draft.categoryId} onChange={event => setDraft({ ...draft, categoryId: Number(event.target.value) })}><option value={0}>{text('choose', 'Choose a category')}</option>{data.categories.map(category => <option key={category.id} value={category.id}>{category.name}{category.visible ? '' : ` (${text('hidden', 'Hidden')})`}</option>)}</select></HousekeepingField>
                <HousekeepingField label={text('order', 'Display order (lower numbers first)')}><input className={HOUSEKEEPING_INPUT_CLASS} type="number" min={0} max={100000} disabled={busy} value={draft.order} onChange={event => setDraft({ ...draft, order: Number(event.target.value) })} /></HousekeepingField>
                <label><input type="checkbox" disabled={busy} checked={draft.visible} onChange={event => setDraft({ ...draft, visible: event.target.checked })} /> {text('show', 'Show in Public')}</label>
            </div>
            <div className="heaven-gallery-admin__picture">
                <img alt={text('preview', 'Preview picture')} src={preview || publicGalleryImageUrl(draft.image) || defaultRoom} />
                <div><label>{text('picture', 'Room picture (PNG or JPEG)')}<input type="file" accept="image/png,image/jpeg" key={`${draft.roomId}:${draft.image}`} disabled={busy} onChange={event => setFile(event.target.files?.[0] ?? null)} /></label>
                    <p>{text('crop', 'Pictures are cropped to a square. Save to publish your selection.')}</p>
                    <HousekeepingButton disabled={busy} variant="secondary" onClick={() => { setFile(null); setDraft({ ...draft, image: '' }); }}>{text('clear', 'Clear picture')}</HousekeepingButton>
                </div>
            </div>
            <HousekeepingButton variant="success" disabled={busy || !Number.isInteger(draft.roomId) || draft.roomId <= 0 || draft.categoryId <= 0 || !Number.isInteger(draft.order) || draft.order < 0 || draft.order > 100000} onClick={() => void save()}>{busy ? text('saving', 'Saving…') : text('save', 'Save room')}</HousekeepingButton>
        </>}
    </div>;
};
