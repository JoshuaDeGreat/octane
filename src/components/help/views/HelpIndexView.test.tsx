import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HelpIndexView } from './HelpIndexView';

const { report } = vi.hoisted(() => ({report: vi.fn()}));
vi.mock('../../../hooks', () => ({useHelp: () => ({report})}));
vi.mock('../../../api', () => ({
    GetRoomSession: () => null,
    ReportType: {STAFF_HELP:10,BULLY:6},
    SendMessageComposer: vi.fn()
}));
vi.mock('@octane/renderer', () => ({GetCfhStatusMessageComposer:class {},GetMyReportsStatusMessageComposer:class {}}));
afterEach(() => {cleanup();vi.clearAllMocks();});

describe('Heaven Hotel help entry points', () => {
    it('opens a staff request without depending on volunteer guides or room history', () => {
        render(<HelpIndexView />);
        fireEvent.click(screen.getByRole('button',{name:'Ask for help'}));
        expect(report).toHaveBeenCalledWith(10,{roomId:0,urgent:false,leaveRoom:false});
        expect(screen.queryByText(/Habbo/)).not.toBeInTheDocument();
    });
    it('carries the optional leave-room choice into an urgent staff request', () => {
        render(<HelpIndexView />);
        fireEvent.click(screen.getByRole('checkbox',{name:'Leave the room after sending'}));
        fireEvent.click(screen.getByRole('button',{name:'Contact staff urgently'}));
        expect(report).toHaveBeenCalledWith(10,{roomId:0,urgent:true,leaveRoom:true});
    });
    it('starts a fully separate player report and explains offline handling', () => {
        render(<HelpIndexView />);
        fireEvent.click(screen.getByRole('button',{name:'Make a report'}));
        expect(report).toHaveBeenCalledWith(6,{roomId:0});
        expect(screen.getByText(/Requests are saved even when staff are offline/)).toBeInTheDocument();
    });
});
