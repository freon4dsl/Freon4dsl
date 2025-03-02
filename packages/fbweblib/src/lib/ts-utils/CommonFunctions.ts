export function isKeyBoardEvent(event: Event): event is KeyboardEvent {
    return 'detail' in event;
}
