const cachedWarnings = new Map<string, boolean>();

export const logWarningNoIndex = (fieldName: string, tableName: string) => {
  const key = `${fieldName}-${tableName}`;
  if (cachedWarnings.has(key)) {
    return;
  }
  cachedWarnings.set(key, true);
  console.warn(
    `CAUTION: Querying without index. Consider setting an index for field "${fieldName}" in table "${tableName}"`
  );
};
