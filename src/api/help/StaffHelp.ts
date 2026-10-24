import { IHelpReport } from './IHelpReport';
import { ReportState } from './ReportState';
import { ReportType } from './ReportType';

export const HEAVEN_SUPPORT_TOPIC = 9001;
export const HEAVEN_URGENT_TOPIC = 9002;
export const MAX_HELP_MESSAGE_LENGTH = 1000;

export const createHelpReport = (type: number, options: Partial<IHelpReport> = {}): IHelpReport => ({
    reportType: type, reportedUserId: -1, reportedChats: [], cfhCategory: -1, cfhTopic: -1,
    roomId: 0, roomName: '', messageId: -1, threadId: -1, groupId: -1, extraData: '',
    roomObjectId: -1, message: '', currentStep: ReportState.SELECT_USER, ...options,
    ...(type === ReportType.STAFF_HELP ? {
        reportedUserId: -1,
        cfhTopic: options.urgent ? HEAVEN_URGENT_TOPIC : HEAVEN_SUPPORT_TOPIC,
        currentStep: ReportState.INPUT_REPORT_MESSAGE
    } : {})
});

export const getReportRoomId = (report: IHelpReport): number =>
    report.roomId > 0 ? report.roomId : report.reportedChats?.[0]?.roomId ?? 0;
