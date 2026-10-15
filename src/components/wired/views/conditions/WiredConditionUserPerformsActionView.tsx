import { FC, useEffect, useState } from 'react';
import { LocalizeText, readWiredUserAction, WiredFurniType, wiredUserActionExtra, WiredUserActionChoice } from '../../../../api';
import { Text } from '../../../../common';
import { useWired } from '../../../../hooks';
import { WiredSourceOption, WiredSourcesSelector } from '../WiredSourcesSelector';
import { WiredUserActionSection } from '../WiredUserActionSection';
import { WiredConditionBaseView } from './WiredConditionBaseView';


const USER_ACTION_SOURCES: WiredSourceOption[] = [
    { value: 0, label: 'wiredfurni.params.sources.users.0' },
    { value: 200, label: 'wiredfurni.params.sources.users.200' },
    { value: 201, label: 'wiredfurni.params.sources.users.201' }
];

interface WiredConditionUserPerformsActionViewProps {
    negative?: boolean;
}

export const WiredConditionUserPerformsActionView: FC<WiredConditionUserPerformsActionViewProps> = (props) => {
    const { negative = false } = props;
    const [choice, setChoice] = useState<WiredUserActionChoice>(() => readWiredUserAction([], ''));
    const [userSource, setUserSource] = useState(0);
    const [quantifier, setQuantifier] = useState(0);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const { trigger = null, setIntParams = null, setStringParam = null } = useWired();
    const quantifierKeyPrefix = negative ? 'wiredfurni.params.quantifier.users.neg' : 'wiredfurni.params.quantifier.users';

    // Official: [action] and the sign / dance extra in the string; the user source and the quantifier
    // follow in the int params until the conditions get their official slots.
    const save = () => {
        setIntParams([choice.action, userSource, quantifier]);
        setStringParam(wiredUserActionExtra(choice));
    };

    useEffect(() => {
        setChoice(readWiredUserAction(trigger?.intData ?? [], trigger?.stringData ?? ''));
        setUserSource(trigger?.intData?.length > 1 ? trigger.intData[1] : 0);
        setQuantifier(trigger?.intData?.length > 2 ? trigger.intData[2] : 0);
        setShowAdvanced(trigger?.intData?.length > 1 ? trigger.intData[1] !== 0 || trigger.intData[2] !== 0 : false);
    }, [trigger]);

    return (
        <WiredConditionBaseView
            hasSpecialInput={true}
            requiresFurni={WiredFurniType.STUFF_SELECTION_OPTION_NONE}
            save={save}
            footerCollapsible={false}
            footer={
                <div className="flex flex-col gap-2">
                    <button className="btn btn-link p-0 align-self-start" type="button" onClick={() => setShowAdvanced((value) => !value)}>
                        {LocalizeText(showAdvanced ? 'wiredfurni.params.sources.collapse' : 'wiredfurni.params.sources.expand')}
                    </button>
                    {showAdvanced && (
                        <>
                            <div className="flex flex-col gap-1">
                                <Text bold>{LocalizeText('wiredfurni.params.quantifier_selection')}</Text>
                                {[0, 1].map((value) => {
                                    return (
                                        <div key={value} className="flex items-center gap-1">
                                            <input
                                                checked={quantifier === value}
                                                className="form-check-input"
                                                id={`userActionQuantifier${value}`}
                                                name="userActionQuantifier"
                                                type="radio"
                                                onChange={() => setQuantifier(value)}
                                            />
                                            <Text>{LocalizeText(`${quantifierKeyPrefix}.${value}`)}</Text>
                                        </div>
                                    );
                                })}
                            </div>
                            <WiredSourcesSelector showUsers={true} userSource={userSource} userSources={USER_ACTION_SOURCES} onChangeUsers={setUserSource} />
                        </>
                    )}
                </div>
            }
        >
            <WiredUserActionSection choice={choice} onChange={setChoice} />
        </WiredConditionBaseView>
    );
};
