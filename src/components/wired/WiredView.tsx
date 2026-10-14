import { ConditionDefinition, TriggerDefinition, WiredActionDefinition, WiredAddonDefinition, WiredSelectorDefinition, WiredVariableDefinition } from '@octane/renderer';
import { FC, Fragment } from 'react';
import { useWired } from '../../hooks';
import { WiredActionLayoutView } from './views/actions/WiredActionLayoutView';
import { WiredConditionLayoutView } from './views/conditions/WiredConditionLayoutView';
import { WiredTriggerLayoutView } from './views/triggers/WiredTriggerLayoutView';

export const WiredView: FC<{}> = (props) => {
    const { trigger = null } = useWired();

    if (!trigger) return null;

    // Addons, selectors and variables arrive in their own official packets but keep their editors,
    // which are registered under their codes in the action layouts.
    if (trigger instanceof WiredAddonDefinition || trigger instanceof WiredSelectorDefinition || trigger instanceof WiredVariableDefinition) {
        return <Fragment key={`wired-${trigger.holder}-${trigger.id}-${trigger.code}`}>{WiredActionLayoutView(trigger.code)}</Fragment>;
    }

    if (trigger instanceof WiredActionDefinition) {
        return <Fragment key={`wired-action-${trigger.id}-${trigger.code}`}>{WiredActionLayoutView(trigger.code)}</Fragment>;
    }

    if (trigger instanceof TriggerDefinition) {
        return <Fragment key={`wired-trigger-${trigger.id}-${trigger.code}`}>{WiredTriggerLayoutView(trigger.code)}</Fragment>;
    }

    if (trigger instanceof ConditionDefinition) {
        return <Fragment key={`wired-condition-${trigger.id}-${trigger.code}`}>{WiredConditionLayoutView(trigger.code)}</Fragment>;
    }

    return null;
};
