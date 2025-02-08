// src/apis/modules/dashboard.api.ts
import CRUD from "@/utils/crud";

const dashboardCrud = new CRUD("/dashboard");

export const dashboardApi = {
  getTrend: (params: { dateRange: [string, string] }) => {
    return dashboardCrud.get<
      Api.Common.Response<Array<{ date: string; value: number }>>
    >("/trend", params);
  },
};
