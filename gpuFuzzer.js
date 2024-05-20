import { dictionaries, generateRandomByteSequence } from './dictionaries.js';

class GPUFuzzer {
    constructor(domElements) {
        this.dictionaries = dictionaries;
        this.domElements = domElements;
        this.adapter = null;
        this.device = null;
        this.fuzzIterations = 100; // Increased number of fuzzing iterations per scenario
    }

    async startFuzzing() {
        await this.initialize();
        if (!this.device) {
            console.warn('WebGPU device is not available.');
            return;
        }
        await this.fuzzGPUBindGroup();
        await this.fuzzGPUBuffer();
        await this.fuzzGPUCanvasContext();
        await this.fuzzGPUCommandEncoder();
        await this.fuzzGPURenderPipeline();
        await this.fuzzGPUShaderModule();
        await this.fuzzGPUSampler();
        await this.fuzzGPUTexture();
        await this.fuzzGPUComputePipeline();
        await this.fuzzGPUQueue();
        await this.fuzzGPURenderPass();
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
        for (let i = 0; i < this.fuzzIterations; i++) {
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
            await this.throttle();
        }
    }

    async fuzzGPUBuffer() {
        for (let i = 0; i < this.fuzzIterations; i++) {
            try {
                const buffer = this.device.createBuffer({
                    size: Math.floor(Math.random() * 4096), // Increased buffer size range
                    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE
                });
                console.log('Fuzzed GPUBuffer:', buffer);
            } catch (error) {
                console.error('Error fuzzing GPUBuffer:', error);
            }
            await this.throttle();
        }
    }

    async fuzzGPUCanvasContext() {
        for (let i = 0; i < this.fuzzIterations; i++) {
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
            await this.throttle();
        }
    }

    async fuzzGPUCommandEncoder() {
        for (let i = 0; i < this.fuzzIterations; i++) {
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
            await this.throttle();
        }
    }

    async fuzzGPURenderPipeline() {
        for (let i = 0; i < this.fuzzIterations; i++) {
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
            await this.throttle();
        }
    }

    async fuzzGPUShaderModule() {
        for (let i = 0; i < this.fuzzIterations; i++) {
            try {
                const shaderModule = this.device.createShaderModule({
                    code: this.generateRandomShaderCode('vertex')
                });
                console.log('Fuzzed GPUShaderModule:', shaderModule);
            } catch (error) {
                console.error('Error fuzzing GPUShaderModule:', error);
            }
            await this.throttle();
        }
    }

    async fuzzGPUSampler() {
        for (let i = 0; i < this.fuzzIterations; i++) {
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
            await this.throttle();
        }
    }

    async fuzzGPUTexture() {
        for (let i = 0; i < this.fuzzIterations; i++) {
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
            await this.throttle();
        }
    }

    async fuzzGPUComputePipeline() {
        for (let i = 0; i < this.fuzzIterations; i++) {
            try {
                const pipeline = this.device.createComputePipeline({
                    layout: 'auto',
                    compute: {
                        module: this.device.createShaderModule({
                            code: `
                                [[stage(compute), workgroup_size(8, 8, 1)]]
                                fn main([[builtin(global_invocation_id)]] global_id : vec3<u32>) {
                                    // Compute shader logic here
                                }
                            `
                        }),
                        entryPoint: 'main'
                    }
                });
                console.log('Fuzzed GPUComputePipeline:', pipeline);
            } catch (error) {
                console.error('Error fuzzing GPUComputePipeline:', error);
            }
            await this.throttle();
        }
    }

    async fuzzGPUQueue() {
        for (let i = 0; i < this.fuzzIterations; i++) {
            try {
                const queue = this.device.queue;
                const buffer = this.device.createBuffer({
                    size: 4,
                    usage: GPUBufferUsage.MAP_WRITE | GPUBufferUsage.COPY_SRC
                });
                await buffer.mapAsync(GPUMapMode.WRITE);
                const mappedRange = buffer.getMappedRange();
                new Uint8Array(mappedRange).set([1, 2, 3, 4]);
                buffer.unmap();
                queue.submit([]);
                console.log('Fuzzed GPUQueue:', queue);
            } catch (error) {
                console.error('Error fuzzing GPUQueue:', error);
            }
            await this.throttle();
        }
    }

    async fuzzGPURenderPass() {
        for (let i = 0; i < this.fuzzIterations; i++) {
            try {
                const commandEncoder = this.device.createCommandEncoder();
                const texture = this.device.createTexture({
                    size: [512, 512, 1],
                    format: 'bgra8unorm',
                    usage: GPUTextureUsage.RENDER_ATTACHMENT
                });
                const renderPassDescriptor = {
                    colorAttachments: [{
                        view: texture.createView(),
                        loadOp: 'clear',
                        storeOp: 'store',
                        clearValue: { r: Math.random(), g: Math.random(), b: Math.random(), a: 1 }
                    }]
                };
                const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
                passEncoder.end();
                this.device.queue.submit([commandEncoder.finish()]);
                console.log('Fuzzed GPURenderPass:', passEncoder);
            } catch (error) {
                console.error('Error fuzzing GPURenderPass:', error);
            }
            await this.throttle();
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

    getRandomFuzzValue(type) {
        const dict = this.dictionaries[type] || [];
        return dict.length > 0 ? dict[Math.floor(Math.random() * dict.length)] : "";
    }

    async throttle() {
        return new Promise(resolve => setTimeout(resolve, 10));
    }
}

export { GPUFuzzer };
