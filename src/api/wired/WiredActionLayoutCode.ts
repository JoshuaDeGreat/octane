export class WiredActionLayoutCode {
    public static TOGGLE_FURNI_STATE: number = 0;
    public static RESET: number = 1;
    public static SET_FURNI_STATE: number = 3;
    public static MOVE_FURNI: number = 4;
    public static GIVE_SCORE: number = 6;
    public static CHAT: number = 7;
    public static TELEPORT: number = 8;
    public static JOIN_TEAM: number = 9;
    public static LEAVE_TEAM: number = 10;
    public static CHASE: number = 11;
    public static FLEE: number = 12;
    public static MOVE_AND_ROTATE_FURNI: number = 13;
    public static GIVE_SCORE_TO_PREDEFINED_TEAM: number = 14;
    public static TOGGLE_TO_RANDOM_STATE: number = 15;
    public static MOVE_FURNI_TO: number = 16;
    public static GIVE_REWARD: number = 17;
    public static CALL_ANOTHER_STACK: number = 18;
    public static KICK_FROM_ROOM: number = 19;
    public static MUTE_USER: number = 20;
    public static BOT_TELEPORT: number = 21;
    public static BOT_MOVE: number = 22;
    public static BOT_TALK: number = 23;
    public static BOT_GIVE_HAND_ITEM: number = 24;
    public static BOT_FOLLOW_AVATAR: number = 25;
    public static BOT_CHANGE_FIGURE: number = 26;
    public static BOT_TALK_DIRECT_TO_AVTR: number = 27;
    public static SEND_SIGNAL: number = 33;
    public static FREEZE: number = 34;
    public static UNFREEZE: number = 35;
    public static FURNI_TO_USER: number = 36;
    public static USER_TO_FURNI: number = 37;
    public static FURNI_TO_FURNI: number = 38;
    public static SET_ALTITUDE: number = 39;
    public static RELATIVE_MOVE: number = 40;
    public static CONTROL_CLOCK: number = 41;
    public static ADJUST_CLOCK: number = 42;
    public static MOVE_ROTATE_USER: number = 43;
    public static GIVE_VARIABLE: number = 69;
    public static REMOVE_VARIABLE: number = 73;
    public static CHANGE_VARIABLE_VALUE: number = 74;
    public static NEG_CALL_ANOTHER_STACK: number = 86;
    public static NEG_SEND_SIGNAL: number = 87;
    public static SET_ROLLER_SPEED: number = 88;
    public static BOT_DANCE: number = 89;
    public static GIVE_POINTS_TYPE: number = 90;
    public static GIVE_OR_TAKE_FURNI: number = 91;
    public static PLAY_YOUTUBE: number = 92;
    public static QUICK_BOPPER: number = 93;
    public static SET_ROOM_AD: number = 94;
    public static MOVE_FURNI_AS_GROUP: number = 95;
    public static GIVE_CURRENCY_FROM_CHEST: number = 99;
    public static GIVE_FURNI_FROM_CHEST: number = 102;
    public static INIT_TRANSACTION: number = 104;
    public static CANCEL_TRANSACTION: number = 105;
    public static PLACE_FURNI: number = 106;
    public static REMOVE_FURNI: number = 107;
    public static CHANGE_OPACITY: number = 114;
    public static WALK_TO_FURNI: number = 115;
    public static USER_TARGET: number = 116;
    public static MOVE_USER_TILES: number = 117;
    public static EFFECT_AMOUNT: number = 118;
    public static EFFECT_BADGE: number = 119;
    public static EFFECT_TAG: number = 120;
    public static EFFECT_ID: number = 121;
    public static EFFECT_MESSAGE: number = 122;
    public static EFFECT_TEXT: number = 123;
    public static ALL_USERS_LEAVE_TEAM: number = 124;
    public static OVERRIDE_HEIGHT: number = 125;

    public static MODIFY_ARRAY: number = 126;


    public static CLICK_SETTINGS: number = 129;


    /** Habbo's "write to logs" (wf_act_log / wf_act_neg_log): a message at a log level into the room log. */
    public static WRITE_TO_LOGS: number = 137;
    /** Habbo's "teleport to room": a typed room, or the room a picked room link or teleporter leads to. */
    public static TELEPORT_TO_ROOM: number = 138;
    /** Habbo's variable leaderboard addon (wf_xtra_var_leaderboard), official addon code 1005. */

    /** Habbo's achievement and reward-track boxes; hotel-wide rewards, gated by the hotel. */
    public static PROGRESS_ACHIEVEMENT: number = 150;
    public static PROGRESS_REWARD_TRACK: number = 152;
    public static RESET_REWARD_TRACK: number = 153;

    /** Global placeholder add-on (wf_xtra_text_output_global); the upstream addon code. */
    /** Daily task variable box (wf_var_daily_task); upstream variable code 8 in the same band. */
}
