const isSynchronousRequire = node => node.value.arguments.length < 2;
const requiresSingleModule = argument =>
  argument.type === 'ArrayExpression' && argument.elements.length === 1;
const isFunction = thing => thing.body.type === 'CallExpression';

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;

  return j(file.source)
    .find(j.CallExpression)
    .filter(e => e.value.callee.name === 'require')
    .replaceWith(path => {
      if (isSynchronousRequire(path)) {
        throw new Error(
          'The dynamic, synchronous form of require is unsupported. Please refactor to include a callback, or import the dependency via a top-level define.',
        );
      }
      const maybeRequireIdList = path.value.arguments[0];
      if (!requiresSingleModule(maybeRequireIdList)) {
        throw new Error(
          'Expected the first argument to require to be an Array containing a single String representing a module id. Received: ' +
            String(maybeRequireIdList),
        );
      }
      /*
    console.log(path.value.arguments[1].body)
      if (!isFunction(path.value.arguments[1])) {
        throw new Error('Expected the second argument to require to be a Function. Received: ' + String(maybeRequireIdList))
      }
      */
      return j.callExpression(
        j.memberExpression(
          j.callExpression(j.identifier('import'), [
            maybeRequireIdList.elements[0],
          ]),
          j.identifier('then'),
        ),
        [path.value.arguments[1]],
      );

      console.log(path);
    })
    .toSource();
};
