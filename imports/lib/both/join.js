import { _ } from 'meteor/underscore';

export function join(objects, fieldData, foreignCollection) {
  if (!Array.isArray(fieldData)) fieldData = [fieldData];
  fieldData = fieldData.map((fd) => {
    if (typeof fd === 'string') fd = { localField: fd };

    return Object.assign({}, {
      newField: fd.localField,
      getter: _.identity,
    }, fd);
  });

  const localFields = fieldData.map(fd => fd.localField);
  const foreignIds = _.flatten(localFields.map(f => objects.map(o => o[f])));
  const foreignObjects = foreignCollection.find({
    _id: {
      $in: _.uniq(foreignIds),
    },
  }).fetch();

  const foreignMap = {};
  _.each(foreignObjects, (fo) => {
    foreignMap[fo._id] = fo;
  });

  _.each(objects, (object) => {
    _.each(fieldData, (fd) => {
      let foreignIds = object[fd.localField];
      delete object[fd.localField];

      const isArray = Array.isArray(foreignIds);
      if (!isArray) foreignIds = [foreignIds];
      foreignIds = foreignIds.filter(_.identity);

      let foreignObjects = foreignIds
        .map(fi => foreignMap[fi])
        .filter(_.identity)
        .map(fd.getter);

      if (!isArray) {
        foreignObjects = foreignObjects.length === 0 ? undefined : foreignObjects[0];
      }
      object[fd.newField] = foreignObjects;
    });
  });

  return objects;
}
