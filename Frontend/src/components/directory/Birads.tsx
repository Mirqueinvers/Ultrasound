import React from "react";

const Birads: React.FC = () => (
  <div className="mt-6">
    <h3 className="text-lg font-semibold text-slate-700 mb-4">������������� BI-RADS</h3>

    <div className="mb-8">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-slate-200 rounded-lg">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b">���������</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b">������� ��������</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b">���� �����������������</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b">������������</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-slate-500 border-b">BI-RADS 0</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">������������ ��������, ��������� �������������� ��� ��������� � �����������</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">�� ����������</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">�������������� ������������</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-green-600 border-b">BI-RADS 1</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">�����, �������������� ��������� ���</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">? 0%</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">�������� ��������</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-green-600 border-b">BI-RADS 2</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">����������������� �������</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">? 0%</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">�������� ��������</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-yellow-600 border-b">BI-RADS 3</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">�������� ����������������� ���������</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">? 2%</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">������������� ���������� (������ 3�6 ���.)</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-orange-500 border-b">BI-RADS 4A</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">������ ������� ����������</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">2�10%</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">������� (��������������� �����������)</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-orange-600 border-b">BI-RADS 4B</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">��������� ������� ����������</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">10�50%</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">������� (��������������� �����������)</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-orange-700 border-b">BI-RADS 4C</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">������� ������� ����������</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">50�95%</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">������� (��������������� �����������)</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-red-600 border-b">BI-RADS 5</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">������� ����������� ����</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">&gt; 95%</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">������� ����������� � �������</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-red-700">BI-RADS 6</td>
              <td className="px-4 py-3 text-sm text-slate-600">�������������� �������������� ���</td>
              <td className="px-4 py-3 text-sm text-slate-600">��������</td>
              <td className="px-4 py-3 text-sm text-slate-600">���� �������/������������</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div className="mb-6">
      <h4 className="text-md font-medium text-slate-600 mb-3">�������� ���� BI-RADS</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h5 className="text-sm font-medium text-slate-700 mb-2">���� �������</h5>
          <p className="text-sm text-slate-600">
            BI-RADS ��������������� ���� �������� �����������, ��� � ��� �������� ����� �
            ��������� ��������� � ���������� �������� �������.
          </p>
        </div>
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h5 className="text-sm font-medium text-slate-700 mb-2">��������� 4A�4C</h5>
          <p className="text-sm text-slate-600">
            ��������� 4 ������� �� ������������ � ������ �������� ����������, �� �� ����
            ������� ��������� ��������������� �����������.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default Birads;

