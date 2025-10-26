import axiosInstance from './axiosInsance';

const MARKET_API_PREFIX = '/market';

// 获取变量列表
export async function getVariableList() {
  const res = await axiosInstance.get(`${MARKET_API_PREFIX}/api/variable/list`);
  return res.data;
}

// 保存/更新流程变量
export async function saveGlobalVariable(data: {
  id?: number;
  name: string;
  dataType: number;
  defaultValue: string;
  description?: string;
  enumValue?: string;
  unit?: string;
  variableType: number;
  relevanceId: number | string | undefined;
}) {
  const res = await axiosInstance.post(`${MARKET_API_PREFIX}/api/v1/caseGlobalVariable/saveGlobalVariable`, data);
  return res.data;
}

// 查询流程变量
export async function queryGlobalVariable(params: {
  variableType: number;
  relevanceId: number | string | undefined;
  name?: string;
}) {
  const res = await axiosInstance.get(`${MARKET_API_PREFIX}/api/v1/caseGlobalVariable/queryGlobalVariable`, { params });
  return res.data;
}

// 推荐流程变量
export async function recommendGlobalVariable(params: {
  variableType: number;
  relevanceId: number | string | undefined;
  name?: string;
  dataType?: number;
}) {
  const res = await axiosInstance.get(`${MARKET_API_PREFIX}/api/v1/caseGlobalVariable/recommendGlobalVariable`, {
    params,
  });
  return res.data;
}

// 删除流程变量
export async function deleteGlobalVariable(id: number) {
  const res = await axiosInstance.get(`${MARKET_API_PREFIX}/api/v1/caseGlobalVariable/deleteGlobalVariable`, {
    params: { id },
  });
  return res.data;
}

// 变量相关的 API 接口
const Api = {
  getVariableList,
  saveGlobalVariable,
  queryGlobalVariable,
  recommendGlobalVariable,
  deleteGlobalVariable,
};

export default Api;
