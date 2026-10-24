import { describe, expect, it } from 'vitest';
import { createHelpReport, getReportRoomId, HEAVEN_SUPPORT_TOPIC, HEAVEN_URGENT_TOPIC } from './StaffHelp';
import { ReportType } from './ReportType';
import { ReportState } from './ReportState';

describe('Heaven staff requests', () => {
    it('can be started from hotel view without a room, another user or chat history', () => {
        const report = createHelpReport(ReportType.STAFF_HELP);
        expect(report.reportedUserId).toBe(-1);
        expect(report.reportedChats).toEqual([]);
        expect(report.cfhTopic).toBe(HEAVEN_SUPPORT_TOPIC);
        expect(report.currentStep).toBe(ReportState.INPUT_REPORT_MESSAGE);
        expect(getReportRoomId(report)).toBe(0);
    });
    it('retains urgent context and room before leaving', () => {
        const report = createHelpReport(ReportType.STAFF_HELP, {roomId: 42, urgent: true, leaveRoom: true});
        expect(report.cfhTopic).toBe(HEAVEN_URGENT_TOPIC);
        expect(report.leaveRoom).toBe(true);
        expect(getReportRoomId(report)).toBe(42);
    });
    it('initializes the complete player-report state instead of spreading null', () => {
        const report = createHelpReport(ReportType.BULLY, {roomId: 42});
        expect(report.currentStep).toBe(ReportState.SELECT_USER);
        expect(report.reportedChats).toEqual([]);
        expect(report.message).toBe('');
        expect(getReportRoomId(report)).toBe(42);
    });
    it('can resolve a room from chat evidence without crashing on an empty list', () => {
        expect(getReportRoomId(createHelpReport(ReportType.BULLY))).toBe(0);
        expect(getReportRoomId(createHelpReport(ReportType.BULLY,{reportedChats:[{roomId: 7} as never]}))).toBe(7);
    });
});
