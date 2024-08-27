import { FieldType, TableRelationType } from '@apps-next/core';
import { Prisma, PrismaField } from '../prisma.types';

type PrismaFieldTypeMapping = {
  [key in PrismaField['kind']]: FieldType;
};

const fieldTypeMapping: PrismaFieldTypeMapping = {
  String: 'String',
  Boolean: 'Boolean',
  Int: 'Number',
  Enum: 'Enum',
};

export const prismaViewFieldsHelper = (
  fieldData: PrismaField,
  tableData: Prisma['dmmf']['datamodel']['models'][number],
  Prisma: Prisma['dmmf']['datamodel']
) => {
  const {
    relationName,
    relationFromFields,
    relationToFields,
    name: fieldName,
    type: fieldType,
    isList,
  } = fieldData;

  const getManyToManyModel = () => {
    const includes = fieldData.type
      .toLowerCase()
      .includes(tableData.name.toLowerCase());

    const modelOfRelationType =
      includes &&
      fieldData.type.toLowerCase().replace(tableData.name.toLowerCase(), '');

    const model = Prisma.models.find(
      (m) => m.name.toLowerCase() === modelOfRelationType
    );
    return model;
  };

  const isManyToManyRelation = () => {
    return (
      relationName &&
      relationFromFields?.length === 0 &&
      relationToFields?.length === 0 &&
      isList &&
      getManyToManyModel()
    );
  };

  const getIsOneToOneRelation = () => {
    return (
      relationName &&
      relationFromFields?.length &&
      relationToFields?.length &&
      !fieldData.isList &&
      !fieldData.isUnique
    );
  };

  const getRelationType = () => {
    let relationType: TableRelationType = 'oneToMany';

    if (isManyToManyRelation()) {
      relationType = 'manyToMany';
    } else if (getIsOneToOneRelation()) {
      relationType = 'oneToOne';
    }

    return relationType;
  };

  const getEnumType = () => {
    return fieldData.kind === 'enum' ? fieldData.type : undefined;
  };

  const getIsRelationalField = () => {
    return relationName && relationFromFields ? true : false;
  };

  const getType = () => {
    let type = fieldTypeMapping[fieldType] ?? 'String';
    type = getIsRelationalField() ? 'Reference' : type;
    type = getIsOneToOneRelation() ? 'OneToOneReference' : type;
    type = getEnumType() ? 'Enum' : type;
    return type;
  };

  const getEnumValues = (enumType?: string) => {
    const enumValues = enumType
      ? Prisma.enums.find((e) => e.name === enumType)?.values
      : undefined;

    return enumValues;
  };

  const getIsIdField = () => {
    return fieldData.isId && fieldData.default ? true : false;
  };

  const getIsRelationalIdField = () => {
    return tableData.fields.find((f) => f.relationFromFields?.[0] === fieldName)
      ? true
      : false;
  };

  const getEnum = () => {
    const enumType = getEnumType();
    const enumValues = getEnumValues(enumType);

    return enumType && enumValues
      ? {
          name: enumType,
          values: enumValues,
        }
      : undefined;
  };

  const getRelation = () => {
    const isRelationalField = getIsRelationalField();
    const relationType = getRelationType();
    const model = getManyToManyModel();

    if (isManyToManyRelation() && model) {
      return {
        type: relationType,
        tableName: model.name.toLowerCase(),
        fieldName: model?.name,
        manyToManyRelation: fieldData.name,
      };
    }

    return isRelationalField
      ? {
          tableName: fieldData.name,
          fieldName: relationFromFields?.[0] ?? '',
          type: relationType,
        }
      : undefined;
  };

  const isOptionForDisplayField = () => {
    if (isManyToManyRelation()) return false;
    if (getIsOneToOneRelation()) return false;
    if (getIsRelationalField()) return false;
    if (getIsRelationalIdField()) return false;
    if (getIsIdField()) return false;
    if (getEnum()) return false;
    if (fieldName.toLowerCase() === 'id') return false;
    if (fieldName.toLowerCase().includes('date')) return false;
    if (fieldName.toLowerCase().includes('id')) return false;
    if (fieldName.toLowerCase().includes('age')) return false;
    if (fieldName.toLowerCase().includes('password')) return false;
    return true;
  };

  return {
    isManyToManyRelation: isManyToManyRelation(),
    isOneToOneRelation: getIsOneToOneRelation(),
    relationType: getRelationType(),
    enumType: getEnumType(),
    type: getType(),
    isRelationalIdField: getIsRelationalIdField(),
    isIdField: getIsIdField(),
    enumValue: getEnum(),
    relation: getRelation(),
    fieldName: getManyToManyModel()?.name.toLowerCase() ?? fieldName,
    isOptionForDisplayField: isOptionForDisplayField(),
  };
};

export const getPrefferedDisplayField = (fieldNames: string[]) => {
  const preffered = [
    'label',
    'name',
    'title',
    'email',
    'username',
    'firstname',
    'lastname',
    'fullname',
    'description',

    // german
    'vorname',
    'nachname',
    'name',
    'benutzername',
    'e-mail',
  ];

  return preffered.find((f) => fieldNames.includes(f));
};
