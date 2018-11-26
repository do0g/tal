module.exports = function transformer(file, api) {
  const j = api.jscodeshift;

  return j(file.source)
    .find(j.CallExpression)
    .filter(e => e.value.callee.name === 'define')
    .forEach(path => {
      if (path.value.arguments[0]) {
        if (path.value.arguments[0].type !== 'Literal') {
          throw new Error('not a string!')
        }
          path.value.arguments = path.value.arguments.slice(1)
      }
    })
    .toSource();
}
