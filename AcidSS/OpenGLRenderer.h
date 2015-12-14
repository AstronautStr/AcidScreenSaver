#include "glUtil.h"
#import <Foundation/Foundation.h>
#include "program.h"

@interface OpenGLRenderer : NSObject 

@property (nonatomic) GLuint defaultFBOName;

- (instancetype) initWithDefaultFBO: (GLuint) defaultFBOName;
- (void) resizeWithWidth:(GLuint)width AndHeight:(GLuint)height;
- (void) render: (float) time;
- (void) dealloc;

@end
