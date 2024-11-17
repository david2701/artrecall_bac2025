const fs = require('fs').promises;
const path = require('path');
const { ESLint } = require('eslint');

module.exports = class ExecutorService {
  static async readProjectTree (directoryPath) {
    const paths = {
      frontend: '../../../frontend',
      backend: '../../../backend',
      default: '../../../'
    };

    try {
      const publicDir = path.join(__dirname, paths[directoryPath] || directoryPath || paths.default);
      return await getDirectoryTree(publicDir);
    } catch (error) {
      console.error('Error reading directory:', error);
      throw error;
    }
  }

  static async readFileContents(filePath) {
    try {
      const fullPath = path.join(__dirname, filePath);
      const content = await fs.readFile(fullPath, 'utf8');
      const lines = content.split('\n');

      const lineObject = {};
      lines.forEach((line, index) => {
        lineObject[index + 1] = line;
      });

      return lineObject;
    } catch (error) {
      console.error('Error reading file:', error);
      throw error;
    }
  }

  static async readFileHeader(filePath, N = 30) {
    try {
      const fullPath = path.join(__dirname, filePath);
      const content = await fs.readFile(fullPath, 'utf8');
      const lines = content.split('\n');

      if (lines.length < N) {
        return { error: `File has less than ${N} lines` };
      }

      const headerLines = lines.slice(0, Math.min(50, lines.length));

      const lineObject = {};
      headerLines.forEach((line, index) => {
        lineObject[index + 1] = line;
      });

      return lineObject;
    } catch (error) {
      console.error('Error reading file header:', error);
      throw error;
    }
  }

  static async readFileLineContext(filePath, lineNumber, windowSize) {
    try {
      const fullPath = path.join(__dirname, filePath);
      const content = await fs.readFile(fullPath, 'utf8');
      const lines = content.split('\n');

      const start = Math.max(0, lineNumber - windowSize);
      const end = Math.min(lines.length, lineNumber + windowSize + 1);

      const contextLines = lines.slice(start, end);

      const lineObject = {};
      contextLines.forEach((line, index) => {
        lineObject[start + index + 1] = line;
      });

      return lineObject;
    } catch (error) {
      console.error('Error reading file line context:', error);
      throw error;
    }
  }

  static async writeFile(filePath, fileContents, N = 500) {
    try {
      const fullPath = path.join(__dirname, filePath);
      const content = await fs.readFile(fullPath, 'utf8');
      const lines = content.split('\n');

      if (lines.length >= N) {
        throw new Error(`File has ${lines.length} lines, which is not less than ${N}`);
      }

      await fs.writeFile(fullPath, fileContents, 'utf8');

      return true;
    } catch (error) {
      console.error('Error writing file:', error);
      throw error;
    }
  }

  static async updateFileLine(filePath, lineNumber, newText) {
    try {
      const fullPath = path.join(__dirname, filePath);
      const content = await fs.readFile(fullPath, 'utf8');
      const lines = content.split('\n');

      if (lineNumber < 1) {
        throw new Error('Invalid line number');
      }

      lines[lineNumber] = newText;

      await fs.writeFile(fullPath, lines.join('\n'), 'utf8');

      return true;
    } catch (error) {
      console.error('Error updating file line:', error);
      throw error;
    }
  }

  static async updateFileSlice(filePath, startLine, endLine, newCode) {
    try {
      const fullPath = path.join(__dirname, filePath);
      const content = await fs.readFile(fullPath, 'utf8');
      const lines = content.split('\n');

      if (startLine < 0 || endLine >= lines.length || startLine > endLine) {
        throw new Error('Invalid line range');
      }

      lines.splice(startLine, endLine - startLine + 1, ...newCode.split('\n'));

      await fs.writeFile(fullPath, lines.join('\n'), 'utf8');

      return true;
    } catch (error) {
      console.error('Error updating file slice:', error);
      throw error;
    }
  }

  static async validateFile(filePath) {
    try {
      const fullPath = path.join(__dirname, filePath);
      const eslint = new ESLint({ overrideConfigFile: path.resolve(__dirname, '../../../app-shell/.eslintrc.cjs') });

      const results = await eslint.lintFiles([fullPath]);

      const formatter = await eslint.loadFormatter('stylish');
      const resultText = formatter.format(results);

      return resultText;
    } catch (error) {
      console.error('Error validating file:', error);
      throw error;
    }
  }

  static async replaceFileContent(filePath, oldCode, newCode) {
    try {
      const fullPath = path.join(__dirname, filePath);
      const content = await fs.readFile(fullPath, 'utf8');

      const updatedContent = content.replace(oldCode, newCode);

      await fs.writeFile(fullPath, updatedContent, 'utf8');

      return { success: true };
    } catch (error) {
      console.error('Error replacing file content:', error);
      return { error: error.message };
    }
  }
};

async function getDirectoryTree(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const result = {};

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory() && (entry.name === 'node_modules' || entry.name === 'app-shell')) {
      continue;
    }

    const relativePath = fullPath.replace('/app', '');

    if (entry.isDirectory()) {
      const subTree = await getDirectoryTree(fullPath);
      Object.keys(subTree).forEach(key => {
        result[key.replace('/app', '')] = subTree[key];
      });
    } else {
      const fileContent = await fs.readFile(fullPath, 'utf8');
      const lineCount = fileContent.split('\n').length;
      result[relativePath] = lineCount;
    }
  }

  return result;
}