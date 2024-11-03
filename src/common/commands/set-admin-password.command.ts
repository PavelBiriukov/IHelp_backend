export class SetAdminPasswordCommand {
  constructor(public readonly userId: string, public readonly password: string) {}
}
