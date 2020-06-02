/**
 * getFieldTopic - get pubsub topic name
 * @param  {string} fieldName
 * @return {string}
 */
export default function getFieldTopic (fieldName) {
  let namespaces = ['field'];

  if (fieldName) namespaces.push(fieldName);

  return namespaces.join('.');
}
