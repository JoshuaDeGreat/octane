import { GetCfhStatusMessageComposer, GetMyReportsStatusMessageComposer } from '@octane/renderer';
import { FC, useState } from 'react';
import { GetRoomSession, ReportType, SendMessageComposer } from '../../../api';
import bullyImage from '../../../assets/images/help/help-bully.png';
import needHelpImage from '../../../assets/images/help/help-need-help.png';
import { useHelp } from '../../../hooks';

export const HelpIndexView: FC<{}> = () => {
    const { report } = useHelp();
    const [leaveRoom, setLeaveRoom] = useState(false);
    const startRequest = (urgent = false) => report(ReportType.STAFF_HELP, {
        roomId: GetRoomSession()?.roomId ?? 0, urgent, leaveRoom: urgent && leaveRoom
    });

    return <div className="octane-help-index">
        <div className="heaven-help-welcome">
            <img src="/branding/heaven-logo.png" alt="Heaven Hotel" />
            <div><strong>A little help. A warm welcome.</strong><span>Our moderators and admins are here to help.</span></div>
        </div>
        <div className="octane-help-index__section-title">MAKE YOURSELF AT HOME</div>
        <div className="octane-help-index__row">
            <img alt="" className="octane-help-index__image" src={needHelpImage} draggable={false} />
            <div className="octane-help-index__copy">
                <h2 className="octane-help-index__heading">Ask the Heaven team</h2>
                <p className="octane-help-index__text">Need help with your account, a room or something in the hotel? Send our staff a request.</p>
                <button className="octane-help-index__button is-heaven" type="button" onClick={() => startRequest()}>Ask for help</button>
            </div>
        </div>
        <div className="octane-help-index__section-title">KEEP HEAVEN WELCOMING</div>
        <div className="octane-help-index__row">
            <div className="heaven-help-report-art"><img alt="" src={bullyImage} draggable={false} /></div>
            <div className="octane-help-index__copy">
                <h2 className="octane-help-index__heading">Report a player</h2>
                <p className="octane-help-index__text">Bullying, scams or inappropriate behaviour? Tell our moderators what happened.</p>
                <button className="octane-help-index__button is-heaven" type="button" onClick={() => report(ReportType.BULLY, {roomId: GetRoomSession()?.roomId ?? 0})}>Make a report</button>
            </div>
        </div>
        <div className="heaven-help-guides">
            <details><summary>The Heaven way</summary><p>Be kind, welcome new guests and respect personal boundaries. Play fairly and follow staff instructions. Reports are private to the staff team.</p></details>
            <details><summary>Keep your account safe</summary><p>Never share your password, email codes or recovery links. Heaven staff will never ask for them. Use the account page on heavenhotel.uk if you need a password recovery link.</p></details>
        </div>
        <div className="octane-help-index__emergency">
            <div className="octane-help-index__emergency-copy"><strong className="octane-help-index__emergency-title">Need urgent staff help?</strong><span className="octane-help-index__emergency-sub">For urgent problems inside the hotel.</span></div>
            <div className="octane-help-index__emergency-actions">
                <button className="octane-help-index__button is-red" type="button" onClick={() => startRequest(true)}>Contact staff urgently</button>
                <label className="octane-help-index__leave"><input checked={leaveRoom} type="checkbox" onChange={e => setLeaveRoom(e.target.checked)} /><span>Leave the room after sending</span></label>
            </div>
        </div>
        <p className="heaven-help-queue-note">Requests are saved even when staff are offline. Staff will reply when available; please send one request per issue.</p>
        <div className="octane-help-index__status">
            <button className="octane-help-index__link" type="button" onClick={() => SendMessageComposer(new GetCfhStatusMessageComposer(false))}>My account status</button>
            <button className="octane-help-index__link" type="button" onClick={() => SendMessageComposer(new GetMyReportsStatusMessageComposer())}>My requests & reports</button>
        </div>
    </div>;
};
