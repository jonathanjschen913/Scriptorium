import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';
import { NextApiRequest, NextApiResponse } from 'next';

const execPromise = promisify(exec);
const prisma = new PrismaClient();

const SHARED_DIR = path.resolve('./shared'); // Shared folder path
const CONTAINER_NAME = 'code-exec';          // Persistent container name

export default async function codeHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { codeTemplateId, stdin } = req.body;

    try {
        const codeTemplate = await prisma.codeTemplate.findUnique({
            where: { templateId: Number(codeTemplateId) },
        });

        if (!codeTemplate) {
            return res.status(404).json({ error: 'Code template not found' });
        }

        const code = await prisma.code.findUnique({
            where: { codeTemplateId: codeTemplate.templateId },
        });

        if (!code) {
            return res.status(404).json({ error: 'Code not found for the given template' });
        }

        const { body, language } = code;
        let fileName: string;

        if (language === 'java') {
            const classNameMatch = body.match(/public\s+class\s+(\w+)/);
            if (!classNameMatch) {
                return res.status(400).json({ error: 'Invalid Java code: no public class found' });
            }
            fileName = `${classNameMatch[1]}.java`;
        } else {
            fileName = `code_${Date.now()}.${getFileExtension(language)}`;
        }

        const filePath = path.join(SHARED_DIR, fileName);

        // Write code to shared folder
        if (body) {
            await writeFileAsync(filePath, body);
        } else {
            return res.status(400).json({ error: 'Code body is undefined' });
        }

        let stdinFilePath: string | null = null;
        if (stdin) {
            stdinFilePath = path.join(SHARED_DIR, `stdin_${Date.now()}.txt`);
            await writeFileAsync(stdinFilePath, stdin);
        } else {
            return res.status(400).json({ error: 'Stdin is undefined' });
        }
        if (stdin) {
            stdinFilePath = path.join(SHARED_DIR, `stdin_${Date.now()}.txt`);
            await writeFileAsync(stdinFilePath, stdin);

            // Wait for stdin file to be created
            await waitForFile(stdinFilePath);
        }

        // Build the execute command
        let executeCommand: string;
        switch (language) {
            case 'c':
                executeCommand = `gcc /code/${fileName} -o /code/${fileName}.out && /code/${fileName}.out`;
                break;
            case 'c++':
                executeCommand = `g++ /code/${fileName} -o /code/${fileName}.out && /code/${fileName}.out`;
                break;
            case 'java':
                executeCommand = `javac /code/${fileName} && java -cp /code ${fileName.replace('.java', '')}`;
                break;
            case 'python':
                executeCommand = `python3 /code/${fileName}`;
                break;
            case 'javaScript':
                executeCommand = `node /code/${fileName}`;
                break;
            case 'ruby':
                executeCommand = `ruby /code/${fileName}`;
                break;
            case 'go':
                executeCommand = `go run /code/${fileName}`;
                break;
            case 'rust':
                executeCommand = `rustc /code/${fileName} -o /code/${fileName}.out && /code/${fileName}.out`;
                break;
            case 'php':
                executeCommand = `php /code/${fileName}`;
                break;
            case 'perl':
                executeCommand = `perl /code/${fileName}`;
                break;
            case 'r':
                executeCommand = `Rscript /code/${fileName}`;
                break;
            default:
                return res.status(400).json({ error: 'Unsupported language' });
        }

        // Construct the docker command with input redirection
        const dockerCommand = stdinFilePath
            ? `docker exec ${CONTAINER_NAME} bash -c "${executeCommand} < /code/${path.basename(stdinFilePath)}"`
            : `docker exec ${CONTAINER_NAME} bash -c "${executeCommand}"`;

        console.log(`Executing Docker command: ${dockerCommand}`);
        const { stdout, stderr } = await execPromise(dockerCommand).catch(error => ({ stdout: error.stdout, stderr: error.stderr }));

        res.status(200).json({ stdout, stderr });

        // Clean up the shared folder after execution
        await clearSharedFolder();
    } catch (error) {
        console.error(error);
        const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
        res.status(500).json({ error: 'Internal Server Error', details: errorMessage });
    } finally {
        await prisma.$disconnect();
    }
}

// Utility to write file asynchronously with promise
async function writeFileAsync(filePath: string, data: string): Promise<void> {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, data, { encoding: 'utf-8' }, (err) => {
            if (err) return reject(err);
            resolve(undefined);
        });
    });
}

// Utility to check if a file exists before proceeding
async function waitForFile(filePath: string): Promise<void> {
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            fs.access(filePath, fs.constants.F_OK, (err) => {
                if (!err) {
                    clearInterval(interval);
                    resolve();
                }
            });
        }, 100); // Check every 100ms
    });
}

// Utility to clear the shared folder
async function clearSharedFolder(): Promise<void> {
    return new Promise((resolve, reject) => {
        fs.readdir(SHARED_DIR, (err, files) => {
            if (err) return reject(err);

            // Delete each file in the shared folder
            Promise.all(files.map(file => {
                return new Promise((resolve, reject) => {
                    fs.unlink(path.join(SHARED_DIR, file), (err) => {
                        if (err) return reject(err);
                        resolve(undefined);
                    });
                });
            }))
                .then(() => resolve())
                .catch(reject);
        });
    });
}

// Utility to get file extension based on language
function getFileExtension(language: string): string {
    switch (language) {
        case 'c':
            return 'c';
        case 'c++':
            return 'cpp';
        case 'java':
            return 'java';
        case 'python':
            return 'py';
        case 'javaScript':
            return 'js';
        case 'ruby':
            return 'rb';
        case 'go':
            return 'go';
        case 'rust':
            return 'rs';
        case 'php':
            return 'php';
        case 'perl':
            return 'pl';
        case 'r':
            return 'r';
        default:
            return '';
    }
}
