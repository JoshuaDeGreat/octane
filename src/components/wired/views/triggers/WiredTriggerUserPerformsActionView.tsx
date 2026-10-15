import { FC, useEffect, useState } from 'react';
import { readWiredUserAction, WiredFurniType, wiredUserActionExtra, WiredUserActionChoice } from '../../../../api';
import { useWired } from '../../../../hooks';
import { WiredUserActionSection } from '../WiredUserActionSection';
import { WiredTriggerBaseView } from './WiredTriggerBaseView';

/** Official "user performs action" trigger: int params [action], the sign / dance extra in the string. */
export const WiredTriggerUserPerformsActionView: FC<{}> = () =>
{
    const { trigger = null, setIntParams = null, setStringParam = null } = useWired();
    const [ choice, setChoice ] = useState<WiredUserActionChoice>(() => readWiredUserAction([], ''));

    useEffect(() =>
    {
        setChoice(readWiredUserAction(trigger?.intData ?? [], trigger?.stringData ?? ''));
    }, [ trigger ]);

    const save = () =>
    {
        setIntParams([ choice.action ]);
        setStringParam(wiredUserActionExtra(choice));
    };

    return (
        <WiredTriggerBaseView hasSpecialInput={ true } requiresFurni={ WiredFurniType.STUFF_SELECTION_OPTION_NONE } save={ save }>
            <WiredUserActionSection choice={ choice } onChange={ setChoice } />
        </WiredTriggerBaseView>
    );
};
