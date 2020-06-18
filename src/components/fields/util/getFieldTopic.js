/**
 * getFieldTopic - get pubsub topic name
 * @param  {string} fieldName
 * @param  {string} verbed (updated or blurred)
 * @return {string}
 */
export default function getFieldTopic (fieldName, verbed) {
  let namespaces = ['field'];

  if (verbed) namespaces.push(verbed);
  if (fieldName) namespaces.push(fieldName);

  return namespaces.join('.');
}
