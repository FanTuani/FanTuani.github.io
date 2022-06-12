# CoopDemo 道具开发指北

_既然已经搭建好了 bukkit 开发环境，不如上手做个道具试试水！_

## 1. 文件结构

主类，本例中名为 CoopPropsDemo  
道具类，本例中名为 Prop

## 2. 主类

此处注意类名与文件名应相同

    public final class CoopPropsDemo extends JavaPlugin {
        public static CoopPropsDemo instance; // 插件引用，会在道具类中注册监听器时用到
    
        @Override
        public void onEnable() {
            new Prop(); // new 出下文道具类监听器，开始监听物品交互
            instance = this; // 初始化插件引用
        }
    
        @Override
        public void onDisable() { }
    }

## 3.道具类

以服务器内 ‘信标’ 道具为例，首先应监听玩家点击左右键的事件  
当玩家点击左右键时手中持有道具物品 ‘信标’ 时，就执行道具效果逻辑

    public class Prop implements Listener { // 记得实现 Listener 接口以监听玩家使用道具的事件
        Prop() { // 构造函数，当在主类中 new 出此类对象时被调用，用于注册监听器
            plugin.getServer().getPluginManager().registerEvents(this, CoopPropsDemo.instance);
            // 固定写法，使此监听器生效
        }

        @Override
        public void onPlayerInt(PlayerInteractEvent event) { // 当玩家进行左右键交互时，此方法被调用
            Player player = event.getPlayer();
            if (player.getInventory().getItemInMainHand().getType() == Material.Beacon) {
                // 道具触发的效果，即下文 magic(player) 调用位置
            }
        }
    }

可以在Prop类中定义函数 magic(Player) 单独实现道具触发效果

    @Override
    void magic(Player player) { // 注意这里要传入使用道具的 player 以进行更多操作
        for (Player otherPlayer : plugin.getServer().getOnlinePlayers()) { // 遍历服务器内所有玩家
            if (otherPlayer != player) { // 当遍历到的玩家是敌对玩家，并非使用道具的玩家时
                otherPlayer.getWorld().strikeLightningEffect(otherPlayer.getLocation());
                // 在敌对玩家处生成闪电特效
                otherPlayer.addPotionEffect(new PotionEffect(PotionEffectType.GLOWING, 10, 1));
                // 为敌对玩家添加时长为 10 tick（半秒）的光灵效果，效果等级为1
            }
        }
    }

上面调用到关于 Player 和 World 的成员方法可以在 API 文档中的
[Player 类](https://bukkit.windit.net/javadoc/org/bukkit/entity/Player.html)
和 [World 类](https://bukkit.windit.net/javadoc/org/bukkit/World.html) 中找到

+ 以闪电效果为例，文档中是这么解释的：

> LightningStrike strikeLightningEffect(Location loc)  
> 在指定的位置劈下不会造成伤害的闪电.  
> 原文： Strikes lightning at the given Location without doing damage
>
>参数:  
> loc - 劈下闪电的位置  
> 返回:  
> lightning（闪电）实体

只需传入闪电特效生成的 Location，即敌对玩家的 Location 即可  
此时进入游戏，手持信标右键就能看到效果了（当然这需要不止一个玩家在服务器内，可以稍微修改代码使道具对自己生效以查看效果）

## 值得尝试的有趣道具

+ 效果大概是可以使玩家向着所视方向进行弹跳


    void magic(Player player) {
        Vector vector = player.getLocation().getDirection();  // 获取玩家所视方向的标准空间向量
        vector.multiply(2) // 强化♂ 
        player.setVelocity(); // 给玩家一个力，芜湖起飞
    }
