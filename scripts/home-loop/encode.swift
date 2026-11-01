import AVFoundation
import AppKit
let args = CommandLine.arguments
let dir = args[1], out = args[2], bitrate = Int(args[3])!
try? FileManager.default.removeItem(atPath: out)
let writer = try! AVAssetWriter(outputURL: URL(fileURLWithPath: out), fileType: .mp4)
writer.shouldOptimizeForNetworkUse = true
let input = AVAssetWriterInput(mediaType: .video, outputSettings: [
  AVVideoCodecKey: AVVideoCodecType.h264, AVVideoWidthKey: 1280, AVVideoHeightKey: 720,
  AVVideoCompressionPropertiesKey: [AVVideoAverageBitRateKey: bitrate, AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel, AVVideoExpectedSourceFrameRateKey: 24],
])
let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: [
  kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA, kCVPixelBufferWidthKey as String: 1280, kCVPixelBufferHeightKey as String: 720,
])
writer.add(input); writer.startWriting(); writer.startSession(atSourceTime: .zero)
let files = try! FileManager.default.contentsOfDirectory(atPath: dir).filter { $0.hasSuffix(".jpg") }.sorted()
for (i, f) in files.enumerated() {
  autoreleasepool {
    while !input.isReadyForMoreMediaData { Thread.sleep(forTimeInterval: 0.01) }
    let cg = NSImage(contentsOfFile: "\(dir)/\(f)")!.cgImage(forProposedRect: nil, context: nil, hints: nil)!
    var pb: CVPixelBuffer?
    CVPixelBufferPoolCreatePixelBuffer(nil, adaptor.pixelBufferPool!, &pb)
    CVPixelBufferLockBaseAddress(pb!, [])
    let ctx = CGContext(data: CVPixelBufferGetBaseAddress(pb!), width: 1280, height: 720, bitsPerComponent: 8, bytesPerRow: CVPixelBufferGetBytesPerRow(pb!), space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue | CGBitmapInfo.byteOrder32Little.rawValue)!
    ctx.draw(cg, in: CGRect(x: 0, y: 0, width: 1280, height: 720))
    CVPixelBufferUnlockBaseAddress(pb!, [])
    adaptor.append(pb!, withPresentationTime: CMTime(value: CMTimeValue(i), timescale: 24))
  }
}
input.markAsFinished()
let sem = DispatchSemaphore(value: 0)
writer.finishWriting { sem.signal() }
sem.wait()
print(writer.status == .completed ? "encoded \(files.count)" : "failed \(String(describing: writer.error))")
