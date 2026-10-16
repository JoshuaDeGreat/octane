import { FC } from 'react';
import { localizeWithFallback, WiredFurniType } from '../../../../api';
import { Text } from '../../../../common';
import { WiredTriggerBaseView } from './WiredTriggerBaseView';

/** Official: no params, only the usage info; the contract comes with the transaction. */
export const WiredTriggerTransactionCompleteView: FC = () => {
    return (
        <WiredTriggerBaseView hasSpecialInput={true} requiresFurni={WiredFurniType.STUFF_SELECTION_OPTION_NONE} save={null}>
            <Text small>{localizeWithFallback('wiredfurni.params.transaction_complete.usage_info', 'Fires when a transaction of this room completes.')}</Text>
        </WiredTriggerBaseView>
    );
};
