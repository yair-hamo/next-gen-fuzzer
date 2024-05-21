import { dictionaries, generateRandomByteSequence } from './dictionaries.js';

class GPUFuzzer {
    constructor(domElements) {
        this.dictionaries = dictionaries;
        this.domElements = domElements;
        this.adapter = null;
        this.device = null;
    }

    async initialize() {
        if (!navigator.gpu) {
            console.warn('WebGPU is not supported in this browser.');
            return;
        }
        try {
            this.adapter = await navigator.gpu.requestAdapter();
            this.device = await this.adapter.requestDevice();
        } catch (error) {
            console.error('Error initializing WebGPU:', error);
        }
    }

    async fuzzGPUBindGroup() {
        try {
            const bindGroup = this.device.createBindGroup({
                layout: this.device.createBindGroupLayout({
                    entries: [{
                        binding: 0,
                        visibility: GPUShaderStage.COMPUTE,
                        buffer: { type: 'uniform' }
                    }]
                }),
                entries: [{
                    binding: 0,
                    resource: { buffer: this.device.createBuffer({
                        size: Math.floor(Math.random() * 1024),
                        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
                    }) }
                }]
            });
            console.log('Fuzzed GPUBindGroup:', bindGroup);
        } catch (error) {
            console.error('Error fuzzing GPUBindGroup:', error);
        }
    }

    async fuzzGPUBuffer() {
        try {
            const buffer = this.device.createBuffer({
                size: Math.floor(Math.random() * 4096), // Increased buffer size range
                usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE
            });
            console.log('Fuzzed GPUBuffer:', buffer);
        } catch (error) {
            console.error('Error fuzzing GPUBuffer:', error);
        }
    }

    async fuzzGPUCanvasContext() {
        try {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('webgpu');
            context.configure({
                device: this.device,
                format: 'bgra8unorm'
            });
            console.log('Fuzzed GPUCanvasContext:', context);
        } catch (error) {
            console.error('Error fuzzing GPUCanvasContext:', error);
        }
    }

    async fuzzGPUCommandEncoder() {
        try {
            const encoder = this.device.createCommandEncoder();
            const pass = encoder.beginRenderPass({
                colorAttachments: [{
                    view: this.device.createTexture({
                        size: [512, 512, 1], // Increased texture size
                        format: 'bgra8unorm',
                        usage: GPUTextureUsage.RENDER_ATTACHMENT
                    }).createView(),
                    loadOp: 'clear',
                    storeOp: 'store',
                    clearValue: { r: Math.random(), g: Math.random(), b: Math.random(), a: 1 }
                }]
            });
            pass.end();
            console.log('Fuzzed GPUCommandEncoder:', encoder);
        } catch (error) {
            console.error('Error fuzzing GPUCommandEncoder:', error);
        }
    }

    async fuzzGPURenderPipeline() {
        try {
            const pipeline = this.device.createRenderPipeline({
                layout: 'auto',
                vertex: {
                    module: this.device.createShaderModule({
                        code: this.generateRandomShaderCode('vertex')
                    }),
                    entryPoint: 'main'
                },
                fragment: {
                    module: this.device.createShaderModule({
                        code: this.generateRandomShaderCode('fragment')
                    }),
                    entryPoint: 'main',
                    targets: [{
                        format: 'bgra8unorm'
                    }]
                },
                primitive: {
                    topology: 'triangle-list'
                }
            });
            console.log('Fuzzed GPURenderPipeline:', pipeline);
        } catch (error) {
            console.error('Error fuzzing GPURenderPipeline:', error);
        }
    }

    async fuzzGPUShaderModule() {
        try {
            const shaderModule = this.device.createShaderModule({
                code: this.generateRandomShaderCode('vertex')
            });
            console.log('Fuzzed GPUShaderModule:', shaderModule);
        } catch (error) {
            console.error('Error fuzzing GPUShaderModule:', error);
        }
    }

    async fuzzGPUSampler() {
        try {
            const sampler = this.device.createSampler({
                magFilter: 'linear',
                minFilter: 'linear',
                mipmapFilter: 'linear',
                addressModeU: 'repeat',
                addressModeV: 'repeat',
                addressModeW: 'repeat'
            });
            console.log('Fuzzed GPUSampler:', sampler);
        } catch (error) {
            console.error('Error fuzzing GPUSampler:', error);
        }
    }

    async fuzzGPUTexture() {
        try {
            const texture = this.device.createTexture({
                size: [Math.floor(Math.random() * 1024), Math.floor(Math.random() * 1024), 1],
                format: 'bgra8unorm',
                usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
            });
            console.log('Fuzzed GPUTexture:', texture);
        } catch (error) {
            console.error('Error fuzzing GPUTexture:', error);
        }
    }

    generateRandomShaderCode(type) {
        const vertexShaders = [
            `[[stage(vertex)]]
            fn main([[builtin(vertex_index)]] VertexIndex : u32) -> [[builtin(position)]] vec4<f32> {
                return vec4<f32>(f32(VertexIndex % 2u), f32(VertexIndex / 2u), 0.0, 1.0);
            }`,
            `[[stage(vertex)]]
            fn main([[builtin(vertex_index)]] VertexIndex : u32) -> [[builtin(position)]] vec4<f32> {
                return vec4<f32>(0.0, 0.0, 0.0, 1.0);
            }`
        ];

        const fragmentShaders = [
            `[[stage(fragment)]]
            fn main() -> [[location(0)]] vec4<f32> {
                return vec4<f32>(1.0, 0.0, 0.0, 1.0);
            }`,
            `[[stage(fragment)]]
            fn main() -> [[location(0)]] vec4<f32> {
                return vec4<f32>(0.0, 1.0, 0.0, 1.0);
            }`
        ];

        if (type === 'vertex') {
            return vertexShaders[Math.floor(Math.random() * vertexShaders.length)];
        } else {
            return fragmentShaders[Math.floor(Math.random() * fragmentShaders.length)];
        }
    }

    async startFuzzing() {
        await this.initialize();
        if (!this.device) {
            console.warn('WebGPU device is not available.');
            return;
        }
        await Promise.all([
            this.fuzzGPUBindGroup(),
            this.fuzzGPUBuffer(),
            this.fuzzGPUCanvasContext(),
            this.fuzzGPUCommandEncoder(),
            this.fuzzGPURenderPipeline(),
            this.fuzzGPUShaderModule(),
            this.fuzzGPUSampler(),
            this.fuzzGPUTexture()
        ]);
    }
}

export { GPUFuzzer };
