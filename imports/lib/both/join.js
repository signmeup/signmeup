import { _ } from "meteor/underscore";

export function join(objects, fieldData, foreignCollection) {
  if (!Array.isArray(fieldData)) fieldData = [fieldData];
  fieldData = fieldData.map(fd => {
    if (typeof fd === "string") fd = { localField: fd };

    return Object.assign(
      {},
      {
        newField: fd.localField,
        getter: _.identity
      },
      fd
    );
  });

  const localFields = fieldData.map(fd => fd.localField);
  const foreignIds = _.flatten(localFields.map(f => objects.map(o => o[f])));
  const allForeignObjects = foreignCollection
    .find({
      _id: { $in: _.uniq(foreignIds) }
    })
    .fetch();

  const foreignMap = {};
  _.each(allForeignObjects, fo => {
    foreignMap[fo._id] = fo;
  });

  return objects.map(object => {
    const newObject = Object.assign({}, object);

    _.each(fieldData, fd => {
      delete newObject[fd.localField];

      let foreignIds = object[fd.localField];
      const isArray = Array.isArray(foreignIds);
      if (!isArray) foreignIds = [foreignIds];
      foreignIds = foreignIds.filter(_.identity);

      let foreignObjects = foreignIds
        .map(fi => foreignMap[fi])
        .filter(_.identity)
        .map(fd.getter);

      if (!isArray) {
        foreignObjects =
          foreignObjects.length === 0 ? undefined : foreignObjects[0];
      }
      newObject[fd.newField] = foreignObjects;
    });

    return newObject;
  });
}
