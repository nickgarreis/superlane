export const PRIMARY_ACTION_BUTTON_CLASS =
  "bg-text-tone-primary txt-tone-inverse hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

export const SECONDARY_ACTION_BUTTON_CLASS =
  "border border-border-soft bg-surface-muted-soft txt-tone-primary hover:bg-surface-hover-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

export const GHOST_ICON_BUTTON_CLASS =
  "rounded-lg txt-tone-muted hover:txt-tone-primary hover:bg-surface-hover-soft transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/35";

export const FILLED_ICON_BUTTON_CLASS =
  "inline-flex h-7 w-7 items-center justify-center rounded-md border border-border-soft bg-surface-muted-soft txt-tone-subtle transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/35";

export const FILLED_ICON_BUTTON_SUCCESS_HOVER_CLASS =
  "hover:bg-status-completed-soft hover:txt-tone-success";

export const FILLED_ICON_BUTTON_DANGER_HOVER_CLASS =
  "hover:bg-popup-danger-soft hover:txt-tone-danger";

export const TABLE_ACTION_ICON_BUTTON_CLASS =
  "p-1.5 rounded-lg transition-colors text-text-muted-weak cursor-pointer disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-white/35";

export const TABLE_ACTION_ICON_BUTTON_SUCCESS_HOVER_CLASS =
  "hover:[background-color:var(--status-completed-soft)] hover:[color:var(--text-tone-success)]";

export const TABLE_ACTION_ICON_BUTTON_DANGER_HOVER_CLASS =
  "hover:[background-color:var(--popup-danger-soft-hover)] hover:[color:var(--text-tone-danger)]";

export const TABLE_ACTION_ICON_BUTTON_SUCCESS_CLASS =
  `${TABLE_ACTION_ICON_BUTTON_CLASS} ${TABLE_ACTION_ICON_BUTTON_SUCCESS_HOVER_CLASS}`;

export const TABLE_ACTION_ICON_BUTTON_DANGER_CLASS =
  `${TABLE_ACTION_ICON_BUTTON_CLASS} ${TABLE_ACTION_ICON_BUTTON_DANGER_HOVER_CLASS}`;

export const UNDERLINE_INPUT_CLASS =
  "w-full bg-transparent border-b border-border-soft rounded-none px-0 txt-tone-primary focus:outline-none focus:border-popup-border-stronger transition-colors placeholder:text-text-muted-weak";

export const SOFT_INPUT_CLASS =
  "bg-surface-muted-soft border border-border-soft txt-tone-primary transition-colors placeholder:text-text-muted-weak focus:outline-none focus:border-popup-border-emphasis";

export const ROW_HOVER_CLASS =
  "border-b border-border-subtle-soft last:border-0 hover:bg-surface-hover-subtle transition-colors";

export const KBD_PILL_CLASS =
  "inline-flex items-center justify-center rounded border border-border-soft bg-surface-muted-soft text-text-muted-medium";

export const DIVIDER_SUBTLE_CLASS = "bg-border-subtle-soft";

export const WARNING_STATUS_PILL_CLASS =
  "inline-flex h-[19px] items-center px-2 py-[2px] txt-role-kbd font-medium tone-warning-soft shrink-0 whitespace-nowrap rounded-full border";

export const IMPORTANT_STATUS_PILL_CLASS =
  "inline-flex h-[19px] items-center px-2 py-[2px] txt-role-kbd font-medium txt-tone-danger border-popup-danger-soft-strong bg-popup-danger-soft shrink-0 whitespace-nowrap rounded-full border";
