const _newline_ = '\n'.charCodeAt(0)
export const PosInfoAdapter = (stream) => {
  let pos = 0, line = 0, col = 0
  
  const self = {
    push: (code) => {
      const ret = stream.push(code)
      const wret = {
        pos,
        line,
        col,
        ...ret,
      }

      pos += 1
      if (code === _newline_) {
        line += 1
        col = 0
      } else {
        col += 1
      }

      return wret
    },
    end: () => {
      const ret = stream.end()
      pos += 1
      col += 1
      return {
        pos,
        line,
        col,
        ...ret,
      }
    }
  }

  return new Proxy(stream, {
    get: (target, prop, rec) => {
      return self[prop] || target[prop]
    }
  })
}