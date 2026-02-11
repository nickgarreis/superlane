export interface CreateProjectWizardState {
  step: number;
  showCloseConfirm: boolean;
  showDeleteConfirm: boolean;
  showDeleteProjectConfirm: boolean;
  createdProjectId: string | null;
  isApprovingReview: boolean;
}
export type CreateProjectWizardAction =
  | { type: "patch"; patch: Partial<CreateProjectWizardState> }
  | { type: "reset" };
export const createInitialCreateProjectWizardState =
  (): CreateProjectWizardState => ({
    step: 1,
    showCloseConfirm: false,
    showDeleteConfirm: false,
    showDeleteProjectConfirm: false,
    createdProjectId: null,
    isApprovingReview: false,
  });
export const reduceCreateProjectWizardState = (
  state: CreateProjectWizardState,
  action: CreateProjectWizardAction,
): CreateProjectWizardState => {
  if (action.type === "patch") {
    return { ...state, ...action.patch };
  }
  return createInitialCreateProjectWizardState();
};
