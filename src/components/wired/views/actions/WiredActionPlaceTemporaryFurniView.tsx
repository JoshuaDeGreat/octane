import { FC, useEffect, useState } from 'react';
import { LocalizeText, localizeWithFallback, WiredFurniType } from '../../../../api';
import sourceFurniIcon from '../../../../assets/images/wired/source_furni.png';
import sourceUserIcon from '../../../../assets/images/wired/source_user.png';
import { Text } from '../../../../common';
import { useWired } from '../../../../hooks';
import { WiredFurniSelectionSourceRow } from '../WiredFurniSelectionSourceRow';
import { sortWiredSourceOptions, useAvailableUserSources } from '../WiredSourcesSelector';
import { WiredActionBaseView } from './WiredActionBaseView';

const SOURCE_TRIGGER = 0;
const SOURCE_PICKED = 100;
const MAX_OFFSET = 64;
const MAX_OFFSET_ALTITUDE = 8000;

const TARGET_FURNI_SOURCES = sortWiredSourceOptions(
    [
        { value: 0, label: 'wiredfurni.params.sources.furni.0' },
        { value: 200, label: 'wiredfurni.params.sources.furni.200' },
        { value: 201, label: 'wiredfurni.params.sources.furni.201' }
    ],
    'furni'
);

const TARGET_USER_SOURCES = sortWiredSourceOptions(
    [
        { value: 0, label: 'wiredfurni.params.sources.users.0' },
        { value: 11, label: 'wiredfurni.params.sources.users.11' },
        { value: 200, label: 'wiredfurni.params.sources.users.200' },
        { value: 201, label: 'wiredfurni.params.sources.users.201' }
    ],
    'users'
);

const clamp = (value: number, bound: number) => Math.max(-bound, Math.min(bound, isNaN(value) ? 0 : value));

/**
 * The official "place furni" (code 55): places temporary copies of the picked furni, as they were when
 * the box was saved. Int params [targetIsUser, location, altitude, offsetX, offsetY, offsetAltitude,
 * spawnWithVariable, valueIsVariable, value, valueTarget]; furni sources [picks, target furni, value
 * furni], user sources [target user, value user]. The spawn-with-variable part is kept as the box
 * sent it until its editor follows.
 */
export const WiredActionPlaceTemporaryFurniView: FC<{}> = () =>
{
    const { trigger = null, setIntParams = null, setSourceTypes = null } = useWired();
    const [ targetIsUser, setTargetIsUser ] = useState(false);
    const [ location, setLocation ] = useState(0);
    const [ altitude, setAltitude ] = useState(0);
    const [ offsetX, setOffsetX ] = useState(0);
    const [ offsetY, setOffsetY ] = useState(0);
    const [ offsetAltitude, setOffsetAltitude ] = useState(0);
    const [ showOffsets, setShowOffsets ] = useState(false);
    const [ targetFurniSource, setTargetFurniSource ] = useState(SOURCE_TRIGGER);
    const [ targetUserSource, setTargetUserSource ] = useState(SOURCE_TRIGGER);
    const availableUserSources = useAvailableUserSources(trigger, TARGET_USER_SOURCES);

    useEffect(() =>
    {
        if(!trigger) return;

        const params = trigger.intData ?? [];

        setTargetIsUser(params[0] === 1);
        setLocation(params[1] === 1 ? 1 : 0);
        setAltitude([ 1, 2 ].includes(params[2]) ? params[2] : 0);
        setOffsetX(clamp(params[3] ?? 0, MAX_OFFSET));
        setOffsetY(clamp(params[4] ?? 0, MAX_OFFSET));
        setOffsetAltitude(clamp(params[5] ?? 0, MAX_OFFSET_ALTITUDE));
        setShowOffsets(!!(params[3] || params[4] || params[5]));
        setTargetFurniSource(trigger.furniSourceTypes?.[1] ?? SOURCE_TRIGGER);
        setTargetUserSource(trigger.userSourceTypes?.[0] ?? SOURCE_TRIGGER);
    }, [ trigger ]);

    const save = () =>
    {
        const params = trigger?.intData ?? [];
        // Spawning with a variable: passed back as the box sent it.
        const spawn = [ params[6] ?? 0, params[7] ?? 0, params[8] ?? 0, params[9] ?? 0 ];

        setIntParams([ targetIsUser ? 1 : 0, location, altitude, offsetX, offsetY, offsetAltitude, ...spawn ]);
        setSourceTypes({
            furni: [ SOURCE_PICKED, targetFurniSource, trigger?.furniSourceTypes?.[2] ?? SOURCE_TRIGGER ],
            users: [ targetUserSource, trigger?.userSourceTypes?.[1] ?? SOURCE_TRIGGER ]
        });
    };

    const customTargetUsed = location === 1 || altitude === 2;
    const radio = (name: string, value: number, current: number, onChange: (value: number) => void, label: string, info?: string) => (
        <label key={ `${ name }${ value }` } className="flex items-start gap-1">
            <input type="radio" className="form-check-input" name={ name } checked={ current === value } onChange={ () => onChange(value) } />
            <span className="flex flex-col">
                <Text>{ label }</Text>
                { info && <Text small className="text-muted">{ info }</Text> }
            </span>
        </label>
    );
    const offsetInput = (label: string, value: number, bound: number, onChange: (value: number) => void) => (
        <div className="flex items-center gap-1">
            <Text small>{ label }</Text>
            <input type="number" className="form-control form-control-sm" style={ { width: 72 } } min={ -bound } max={ bound } value={ value } onChange={ event => onChange(clamp(parseInt(event.target.value, 10), bound)) } />
        </div>
    );

    return (
        <WiredActionBaseView hasSpecialInput={ true } requiresFurni={ WiredFurniType.STUFF_SELECTION_OPTION_BY_ID } save={ save }>
            <div className="flex flex-col gap-2">
                <Text small>{ localizeWithFallback('wiredfurni.params.place_furni.usage_info', 'Places temporary copies of the picked furni, as they are when you save.') }</Text>

                <div className="flex flex-col gap-1">
                    <Text bold>{ localizeWithFallback('wiredfurni.params.place_furni.target_location', 'Location') }</Text>
                    { radio('placeLocation', 0, location, setLocation, localizeWithFallback('wiredfurni.params.place_furni.target_location.0', 'Where the furni stood'), localizeWithFallback('wiredfurni.params.place_furni.target_location.0.info', '')) }
                    { radio('placeLocation', 1, location, setLocation, localizeWithFallback('wiredfurni.params.place_furni.target_location.1', 'At the custom target')) }
                </div>

                <div className="flex flex-col gap-1">
                    <Text bold>{ localizeWithFallback('wiredfurni.params.place_furni.target_altitude', 'Altitude') }</Text>
                    { [ 0, 1, 2 ].map(value => radio('placeAltitude', value, altitude, setAltitude, localizeWithFallback(`wiredfurni.params.place_furni.target_altitude.${ value }`, [ 'On top of the location', 'The furni\'s own altitude', 'The custom target\'s altitude' ][value]))) }
                </div>

                <div className="flex flex-col gap-1">
                    <button type="button" className="btn btn-link p-0 align-self-start" onClick={ () => setShowOffsets(value => !value) }>
                        <Text bold>{ localizeWithFallback('wiredfurni.params.place_furni.offsets', 'Offsets') }</Text>
                    </button>
                    { showOffsets &&
                        <div className="flex flex-wrap items-center gap-3">
                            { offsetInput(localizeWithFallback('wiredfurni.params.place_furni.offsets.x', 'x:'), offsetX, MAX_OFFSET, setOffsetX) }
                            { offsetInput(localizeWithFallback('wiredfurni.params.place_furni.offsets.y', 'y:'), offsetY, MAX_OFFSET, setOffsetY) }
                            { offsetInput(localizeWithFallback('wiredfurni.params.place_furni.offsets.altitude', 'altitude:'), offsetAltitude, MAX_OFFSET_ALTITUDE, setOffsetAltitude) }
                        </div> }
                </div>

                <hr className="m-0 bg-dark" />

                <div className={ customTargetUsed ? '' : 'opacity-50 pointer-events-none' }>
                    <WiredFurniSelectionSourceRow
                        title="wiredfurni.params.sources.merged.title.custom_target"
                        options={ targetIsUser ? availableUserSources : TARGET_FURNI_SOURCES }
                        value={ targetIsUser ? targetUserSource : targetFurniSource }
                        selectionKind={ targetIsUser ? 'primary' : 'secondary' }
                        selectionActive={ false }
                        selectionCount={ 0 }
                        selectionLimit={ 0 }
                        selectionEnabledValues={ [] }
                        showSelectionToggle={ false }
                        headerContent={
                            <div className="octane-wired__give-var-targets">
                                { [ { key: 'furni', icon: sourceFurniIcon, isUser: false }, { key: 'user', icon: sourceUserIcon, isUser: true } ].map(button => (
                                    <button
                                        key={ button.key }
                                        type="button"
                                        title={ LocalizeText(`wiredfurni.params.sources.${ button.isUser ? 'users' : 'furni' }.title`) }
                                        className={ `octane-wired__give-var-target octane-wired__give-var-target--${ button.key } ${ targetIsUser === button.isUser ? 'is-active' : '' }` }
                                        onClick={ () => setTargetIsUser(button.isUser) }>
                                        <img src={ button.icon } alt={ button.key } />
                                    </button>
                                )) }
                            </div>
                        }
                        onChange={ value => (targetIsUser ? setTargetUserSource(value) : setTargetFurniSource(value)) } />
                </div>
            </div>
        </WiredActionBaseView>
    );
};
