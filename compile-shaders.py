#!/usr/bin/env python3

import os

ShaderDir = "shaders"
MaxLen = 80

entries = []
for file in os.listdir(ShaderDir):
    if file.find(".glsl") == -1:
        continue

    lines = open(os.path.join(ShaderDir, file)).read().strip().split('\n')

    splitLines = []
    for line in lines:
        if not line.strip():
            splitLines[-1] = splitLines[-1][:-1] + "\\n'"
            splitLines.append('')
        else:
            justLen = min(len(line), MaxLen)
            parts = [line[i:i + MaxLen] for i in range(0, len(line), MaxLen)]
            for i in parts[:-1]:
                splitLines.append(("'" + i + "'").rjust(justLen))
            splitLines.append(("'" + parts[-1] + "\\n'").rjust(justLen))

    lineLen = len(max(splitLines, key=len))

    source = ""
    for i, line in enumerate(splitLines):
        if line:
            source += "        "
            if i < len(splitLines) - 1:
                source += line.ljust(lineLen) + " +"
            else:
                source += line
        if i < len(splitLines) - 1:
            source += '\n'

    entries.append("    '{}':\n{}".format(file
                                          .replace('.glsl', '')
                                          .replace('.hs', '')
                                          .replace('.fs', '')
                                          .replace('.vs', ''), source))

open("src/Scene/Graphics/Shaders.js",
     'w').write("export default {\n" + ",\n\n".join(entries) + "\n}")
