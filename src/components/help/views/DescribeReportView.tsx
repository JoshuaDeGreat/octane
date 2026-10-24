import { FC, useState } from 'react';
import { LocalizeText, MAX_HELP_MESSAGE_LENGTH, ReportState, ReportType } from '../../../api';
import { Button, Flex, Text } from '../../../common';
import { useHelp } from '../../../hooks';

export const DescribeReportView: FC<{}> = (props) => {
    const { activeReport = null, setActiveReport = null } = useHelp();
    const [message, setMessage] = useState(activeReport?.message ?? '');

    const submitMessage = () => {
        if (message.trim().length < 15 || message.length > MAX_HELP_MESSAGE_LENGTH) return;

        setActiveReport((prevValue) => {
            const currentStep = ReportState.REPORT_SUMMARY;

            return { ...prevValue, message: message.trim(), currentStep };
        });
    };

    const back = () => {
        if (activeReport.reportType === ReportType.STAFF_HELP) { setActiveReport(null); return; }
        setActiveReport((prevValue) => {
            return { ...prevValue, currentStep: prevValue.currentStep - 1 };
        });
    };

    return (
        <>
            <div className="flex flex-col gap-1">
                <Text fontSize={4}>{activeReport.urgent ? 'Tell Heaven staff what is urgent' : 'How can the Heaven team help?'}</Text>
                <Text>Describe what happened and where. Our moderators and admins will review your message.</Text>
            </div>
            <textarea
                className="min-h-[calc(1.5em+ .5rem+2px)] px-[.5rem] py-[.25rem]  rounded-[.2rem] h-full"
                value={message}
                aria-label="Message to Heaven staff"
                maxLength={MAX_HELP_MESSAGE_LENGTH}
                placeholder="Tell us what you need help with. Never include your password or recovery codes."
                onChange={(event) => setMessage(event.target.value)}
            />
            <small>{message.length}/{MAX_HELP_MESSAGE_LENGTH} characters · at least 15 characters</small>
            <Flex gap={2} justifyContent="between">
                <Button
                    variant="secondary"
                    onClick={back}
                >
                    {LocalizeText('generic.back')}
                </Button>
                <Button disabled={message.trim().length < 15} onClick={submitMessage}>
                    {LocalizeText('help.emergency.main.submit.button')}
                </Button>
            </Flex>
        </>
    );
};
