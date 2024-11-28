type UpdatePointsInTasksType = {
  points: number;
  id: string;
};

export class UpdatePointsInTasksCommand {
  constructor(public readonly dto: UpdatePointsInTasksType) {}
}
