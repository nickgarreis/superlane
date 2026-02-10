/** @vitest-environment jsdom */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NotificationsTab } from "./NotificationsTab";

describe("NotificationsTab", () => {
  test("renders three event toggles and saves the expected payload", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);

    render(
      <NotificationsTab
        data={{
          events: {
            eventNotifications: true,
            teamActivities: true,
            productUpdates: true,
          },
        }}
        onSave={onSave}
      />,
    );

    expect(screen.queryByText("Desktop Channel")).not.toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "Event Notifications" })).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "Team Activities" })).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "Product Updates" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("switch", { name: "Team Activities" }));
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        events: {
          eventNotifications: true,
          teamActivities: false,
          productUpdates: true,
        },
      });
    });
  });
});
